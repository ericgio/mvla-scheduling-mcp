import ical, { type VEvent, type CalendarResponse } from 'node-ical';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Logger } from 'pino';
import { cacheGet, cacheSet } from '../lib/cache.js';
import type { CalendarResult } from '../lib/types.js';
import { withToolLogging } from '../lib/tool-logging.js';

function isVEvent(e: unknown): e is VEvent {
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { type?: string }).type === 'VEVENT'
  );
}

const CACHE_TTL_MS = 5 * 60 * 1000;

const calendarSchema = {
  url: z.string().describe('Calendar subscription URL (.ics feed)'),
  start_date: z
    .string()
    .optional()
    .describe(
      'Only include events on or after this date (YYYY-MM-DD). Defaults to today.',
    ),
  end_date: z
    .string()
    .optional()
    .describe(
      'Only include events on or before this date (YYYY-MM-DD). Defaults to 90 days from today.',
    ),
  force_refresh: z
    .boolean()
    .optional()
    .describe('Bypass the 5-minute cache and fetch the latest calendar data.'),
};

export function registerCalendarTool(server: McpServer, log: Logger): void {
  server.tool(
    'get_calendar_schedule',
    'Fetches and parses any calendar subscription URL — Google Calendar, Byga, Apple Calendar, ' +
      'or any standard .ics feed. Use for coach calendars, team schedules, away team conflicts, ' +
      'or any external calendar. Accepts optional date range to filter results.',
    calendarSchema,
    async ({ url, start_date, end_date, force_refresh }) =>
      withToolLogging(
        'get_calendar_schedule',
        { url, start_date, end_date },
        async () => {
          const cacheKey = `calendar:${url}`;

          const now = new Date();
          const from = start_date ? new Date(start_date) : now;
          const to = end_date
            ? new Date(end_date)
            : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

          const cached = !force_refresh
            ? cacheGet<CalendarResponse>(cacheKey)
            : null;
          const raw = cached ?? (await ical.async.fromURL(url));
          if (!cached) cacheSet(cacheKey, raw, CACHE_TTL_MS);

          const events = Object.values(raw)
            .filter(isVEvent)
            .filter((e) => {
              const start = new Date(e.start);
              return start >= from && start <= to;
            })
            .sort(
              (a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime(),
            )
            .map((e) => {
              const start = new Date(e.start);
              const end = new Date(e.end as Date);
              const summary =
                typeof e.summary === 'string'
                  ? e.summary
                  : ((e.summary as { val?: string })?.val ?? '(no title)');
              const location =
                typeof e.location === 'string' ? e.location : null;
              return {
                summary,
                date: start.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                }),
                start: start.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }),
                end: end.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }),
                location,
              };
            });

          const result: CalendarResult = {
            eventCount: events.length,
            events,
            fetchedAt: new Date().toISOString(),
          };

          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        },
      ),
  );
}
