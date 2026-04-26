import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Logger } from 'pino';
import { fetchBytes } from '../lib/http.js';
import { parseScheduleXlsx } from '../lib/xlsx.js';
import { cacheGet, cacheSet } from '../lib/cache.js';
import type { ScheduleResult } from '../lib/types.js';

const CACHE_TTL_MS = 5 * 60 * 1000;

export function registerGotsportTool(server: McpServer, log: Logger): void {
  server.tool(
    'get_gotsport_schedule',
    'Fetches a team\'s schedule from GotSport via the public XLSX export endpoint (no auth required). ' +
      'Returns all games for the season including past results and future fixtures. ' +
      'The response includes a fetchedAt timestamp — use force_refresh=true when you need ' +
      'current data (e.g. checking a result from a game that just finished, or verifying a ' +
      'recent schedule change).',
    {
      event_id: z
        .union([z.string(), z.number()])
        .describe('GotSport event (season) ID — from the URL: /org_event/events/<ID>/'),
      team_id: z
        .union([z.string(), z.number()])
        .describe('GotSport team registration ID — from the URL query string: ?team=<ID>'),
      force_refresh: z
        .boolean()
        .optional()
        .describe(
          'Bypass the 5-minute cache and fetch fresh data from GotSport. ' +
            'Use this when you need up-to-date results or schedule changes.',
        ),
    },
    async ({ event_id, team_id, force_refresh }) => {
      const t0 = Date.now();
      const cacheKey = `gotsport:${event_id}:${team_id}`;
      log.info({ tool: 'get_gotsport_schedule', event_id, team_id, force_refresh }, 'tool call');

      try {
        if (!force_refresh) {
          const cached = cacheGet<ScheduleResult>(cacheKey);
          if (cached) {
            log.info(
              { tool: 'get_gotsport_schedule', latency_ms: Date.now() - t0, ok: true, source: 'cache' },
              'tool done',
            );
            return { content: [{ type: 'text', text: JSON.stringify(cached, null, 2) }] };
          }
        }

        const url =
          `https://system.gotsport.com/org_event/events/${event_id}/matches_export?team=${team_id}`;

        const { bytes, contentType, contentDisposition } = await fetchBytes(url, {
          method: 'POST',
          headers: {
            Accept:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: `https://system.gotsport.com/org_event/events/${event_id}/schedules?team=${team_id}`,
          },
        });

        if (contentType.includes('text/html') || bytes.subarray(0, 5).toString() === '<!DOC') {
          throw new Error(
            'GotSport returned HTML instead of XLSX — likely a captcha or invalid event/team ID',
          );
        }

        const parsed = parseScheduleXlsx(bytes, { contentDisposition });
        const result: ScheduleResult = { ...parsed, fetchedAt: new Date().toISOString() };

        cacheSet(cacheKey, result, CACHE_TTL_MS);

        log.info(
          { tool: 'get_gotsport_schedule', latency_ms: Date.now() - t0, ok: true, source: 'fetch' },
          'tool done',
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error(
          { tool: 'get_gotsport_schedule', latency_ms: Date.now() - t0, ok: false, error: message },
          'tool error',
        );
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to fetch GotSport schedule: ${message}` }],
        };
      }
    },
  );
}
