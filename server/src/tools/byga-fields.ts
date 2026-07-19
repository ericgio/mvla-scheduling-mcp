import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Logger } from 'pino';
import { withToolLogging } from '../lib/tool-logging.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Resolves relative to the compiled file (server/dist/tools/), so three hops up
// reaches the repo root regardless of process.cwd().
const WORKAROUND_PATH = resolve(
  __dirname,
  '../../../docs/instructions/field_availability_workaround.md',
);

interface Slot {
  id: string;
  start: string;
  end: string;
  title: string;
  available: boolean;
}

interface FormattedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  field: string;
  available: boolean;
  raw: { start: string; end: string };
}

function toISOWithOffset(dateStr: string, endOfDay: boolean): string {
  const time = endOfDay ? 'T23:59:59' : 'T00:00:00';
  const d = new Date(dateStr + time);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return dateStr + time + `${sign}${pad(off / 60)}:${pad(off % 60)}`;
}

function formatSlot(slot: Slot): FormattedSlot {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  return {
    id: slot.id,
    date: start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    startTime: start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    endTime: end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    field: slot.title,
    available: slot.available,
    raw: { start: slot.start, end: slot.end },
  };
}

const bygaFieldsSchema = {
  schedule_id: z.string().describe('Byga game schedule ID'),
  team_id: z.string().describe('Byga team ID'),
  format: z
    .string()
    .describe(
      'Field format required for the team (e.g. "7v7", "9v9", "11v11")',
    ),
  start_date: z.string().describe('Start date in YYYY-MM-DD format'),
  end_date: z.string().describe('End date in YYYY-MM-DD format'),
};

export function registerBygaFieldsTool(server: McpServer, log: Logger): void {
  server.tool(
    'get_field_availability',
    'Returns field slot availability for a date range, or workaround instructions if the Byga API ' +
      'is not yet connected. Always call with all required params. ' +
      'Check the `status` field in the response: ' +
      'if `"data"`, use `slots` directly; ' +
      'if `"unconnected"`, follow the `instructions` to fetch availability via Claude in Chrome — ' +
      'the params you passed are echoed in `params_received` for reference. ' +
      'Required params: schedule_id, team_id, format, start_date, end_date.',
    bygaFieldsSchema,
    async ({ schedule_id, team_id, format, start_date, end_date }) =>
      withToolLogging(
        'get_field_availability',
        { schedule_id, team_id },
        async () => {
          const params_received = {
            schedule_id,
            team_id,
            format,
            start_date,
            end_date,
          };
          const connected = process.env.ENABLE_FIELD_AVAILABILITY === 'true';

          if (!connected) {
            try {
              const instructions = readFileSync(WORKAROUND_PATH, 'utf-8');
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      { status: 'unconnected', instructions, params_received },
                      null,
                      2,
                    ),
                  },
                ],
              };
            } catch (err) {
              const message =
                'Could not read field availability workaround instructions: ' +
                (err instanceof Error ? err.message : String(err)) +
                ` (looked at ${WORKAROUND_PATH})`;
              return {
                isError: true,
                content: [{ type: 'text', text: message }],
              };
            }
          }

          // Connected mode: fetch live slot data from Byga API.
          const bygaBase = process.env.BYGA_BASE_URL ?? '';
          if (!bygaBase) {
            const message =
              'Error: BYGA_BASE_URL is not set (e.g. https://yourclub.byga.net).';
            return {
              isError: true,
              content: [{ type: 'text', text: message }],
            };
          }

          const startIso = encodeURIComponent(
            toISOWithOffset(start_date, false),
          );
          const endIso = encodeURIComponent(toISOWithOffset(end_date, true));
          const url =
            `${bygaBase}/events?game_schedule_id=${schedule_id}&show_usage=true&slots=false` +
            `&start=${startIso}&end=${endIso}&_=${Date.now()}`;

          try {
            const res = await fetch(url, {
              headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: `${bygaBase}/game_schedules/${schedule_id}?tab=field_request&team_id=${team_id}`,
              },
            });

            if (!res.ok) {
              const message = `Byga returned HTTP ${res.status}. Check that BYGA_BASE_URL, schedule_id, and team_id are correct.`;
              return {
                isError: true,
                content: [
                  {
                    type: 'text',
                    text: message,
                  },
                ],
              };
            }

            const data = (await res.json()) as Slot[];
            // Filter by format: slot title contains the format string (e.g. "7v7").
            const slots = data
              .filter((s) => s.title.includes(format))
              .map(formatSlot);

            const result = {
              status: 'data',
              slots,
              fetchedAt: new Date().toISOString(),
            };

            return {
              content: [
                { type: 'text', text: JSON.stringify(result, null, 2) },
              ],
            };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
              isError: true,
              content: [
                { type: 'text', text: `Failed to fetch from Byga: ${message}` },
              ],
            };
          }
        },
      ),
  );
}
