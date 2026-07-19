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
const DOCS_DIR = resolve(__dirname, '../../../docs/instructions');

const TOPICS: Record<string, string> = {
  season_context: 'season_context.md',
};

const topicList = Object.keys(TOPICS).join(', ');

const instructionsSchema = {
  topic: z
    .string()
    .describe(`The instruction topic to fetch. Valid topics: ${topicList}`),
};

export function registerInstructionsTool(server: McpServer, log: Logger): void {
  server.tool(
    'get_instructions',
    'Fetches step-by-step instructions for infrequent tasks. Call this instead of guessing — ' +
      'the returned markdown is the authoritative guide for that task. ' +
      'Available topics:\n' +
      '- `season_context` — full instructions for generating a season context doc for a team ' +
      '(extraction steps, output rules, template, new-season flow). ' +
      'Call this when the user has no season context doc in Project Knowledge or asks to set up a new season.',
    instructionsSchema,
    async ({ topic }) =>
      withToolLogging('get_instructions', { topic }, async () => {
        const filename = TOPICS[topic];
        if (!filename) {
          const message = `Unknown topic "${topic}". Valid topics: ${topicList}`;
          return { isError: true, content: [{ type: 'text', text: message }] };
        }

        const filePath = resolve(DOCS_DIR, filename);
        try {
          const content = readFileSync(filePath, 'utf-8');
          return { content: [{ type: 'text', text: content }] };
        } catch (err) {
          const message =
            `Could not read instructions for "${topic}": ` +
            (err instanceof Error ? err.message : String(err)) +
            ` (looked at ${filePath})`;
          return { isError: true, content: [{ type: 'text', text: message }] };
        }
      }),
  );
}
