import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Request, type Response } from 'express';
import pino from 'pino';
import { registerGotsportTool } from './tools/gotsport.js';
import { registerCalendarTool } from './tools/calendar.js';
import { registerBygaFieldsTool } from './tools/byga-fields.js';
import { registerInstructionsTool } from './tools/instructions.js';

const transport = (process.env.MCP_TRANSPORT ?? 'stdio').toLowerCase();
const isHttp = transport === 'http';

// Logs go to stderr in stdio mode (stdout is the MCP protocol channel).
const log = pino(
  { level: process.env.LOG_LEVEL ?? 'info' },
  pino.destination(isHttp ? 1 : 2),
);

const fieldAvailabilityEnabled = process.env.ENABLE_FIELD_AVAILABILITY === 'true';

function createServer(): McpServer {
  const server = new McpServer({ name: 'mvla-scheduling-mcp', version: '1.0.0' });
  registerGotsportTool(server, log);
  registerCalendarTool(server, log);
  registerInstructionsTool(server, log);
  if (fieldAvailabilityEnabled) registerBygaFieldsTool(server, log);
  return server;
}

if (isHttp) {
  const port = Number(process.env.PORT ?? 3001);
  const app = express();
  app.use(express.json());

  // Stateless: new server + transport per request.
  app.post('/mcp', async (req: Request, res: Response) => {
    try {
      const server = createServer();
      const httpTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      res.on('close', () => {
        httpTransport.close();
        server.close();
      });
      await server.connect(httpTransport);
      await httpTransport.handleRequest(req, res, req.body);
    } catch (err) {
      log.error({ err }, 'MCP request error');
      if (!res.headersSent) res.status(500).json({ error: 'internal error' });
    }
  });

  app.get('/mcp', (_req: Request, res: Response) => res.status(405).json({ error: 'method not allowed' }));
  app.delete('/mcp', (_req: Request, res: Response) => res.status(405).json({ error: 'method not allowed' }));
  app.get('/health', (_req: Request, res: Response) => res.json({ ok: true, server: 'mvla-scheduling-mcp' }));

  app.listen(port, () => {
    log.info({ port }, 'mvla-scheduling-mcp HTTP server ready');
  });
} else {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  log.info('mvla-scheduling-mcp stdio transport ready');
}
