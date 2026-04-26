import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Logger } from 'pino';

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
    date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    startTime: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    endTime: end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    field: slot.title,
    available: slot.available,
    raw: { start: slot.start, end: slot.end },
  };
}

export function registerBygaFieldsTool(
  server: McpServer,
  log: Logger,
): void {
  server.tool(
    'get_field_availability',
    'Fetch field slot availability from Byga for a date range. Returns all slots (available and ' +
      'booked) so scheduling conflicts can be detected.',
    {
      schedule_id: z.string().describe('Byga game schedule ID'),
      team_id: z.string().describe('Byga team ID'),
      start_date: z.string().describe('Start date in YYYY-MM-DD format'),
      end_date: z.string().describe('End date in YYYY-MM-DD format'),
      available_only: z
        .boolean()
        .optional()
        .describe('If true, return only available slots (default: false)'),
    },
    async ({ schedule_id, team_id, start_date, end_date, available_only = false }) => {
      const t0 = Date.now();
      log.info({ tool: 'get_field_availability', schedule_id, team_id, start_date, end_date, available_only }, 'tool call');

      const bygaBase = process.env.BYGA_BASE_URL ?? '';

      if (!bygaBase) {
        return {
          content: [{ type: 'text', text: 'Error: BYGA_BASE_URL is not set (e.g. https://yourclub.byga.net).' }],
        };
      }

      const startIso = encodeURIComponent(toISOWithOffset(start_date, false));
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
          return {
            content: [
              {
                type: 'text',
                text: `Byga returned HTTP ${res.status}. Check that BYGA_BASE_URL, schedule_id, and team_id are correct.`,
              },
            ],
          };
        }

        const data = (await res.json()) as Slot[];
        const slots = data
          .filter((s) => !available_only || s.available === true)
          .map(formatSlot);

        const availableCount = slots.filter((s) => s.available).length;
        let output = `Found ${slots.length} total slots (${availableCount} available) between ${start_date} and ${end_date}.\n\n`;

        const byDate: Record<string, FormattedSlot[]> = {};
        for (const slot of slots) {
          if (!byDate[slot.date]) byDate[slot.date] = [];
          byDate[slot.date].push(slot);
        }
        for (const [date, dateSlots] of Object.entries(byDate)) {
          output += `${date}:\n`;
          for (const s of dateSlots) {
            output += `  ${s.startTime} – ${s.endTime}  ${s.field}  [${s.available ? '✓ AVAILABLE' : '✗ booked'}]\n`;
          }
          output += '\n';
        }

        log.info(
          { tool: 'get_field_availability', latency_ms: Date.now() - t0, ok: true, slotCount: slots.length },
          'tool done',
        );
        return { content: [{ type: 'text', text: output }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error(
          { tool: 'get_field_availability', latency_ms: Date.now() - t0, ok: false, error: message },
          'tool error',
        );
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to fetch from Byga: ${message}` }],
        };
      }
    },
  );
}
