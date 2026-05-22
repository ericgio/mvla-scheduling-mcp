# mvla-scheduling-mcp

MCP server that gives Claude real-time access to soccer game schedules and field availability. Runs as an HTTP server; the `/mcp` endpoint is registered as a custom connector in Claude.ai.

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `get_gotsport_schedule` | None | Fetches a team's schedule from GotSport via the public XLSX export endpoint |
| `get_calendar_schedule` | None | Fetches any calendar subscription URL (Google Calendar, Byga, .ics feeds) |
| `get_field_availability` | — | Disabled in HTTP mode (requires a local Byga session cookie) |

Both active tools accept `force_refresh` to bypass the 5-minute cache. The `fetchedAt` timestamp in every response lets Claude reason about data freshness.

## Why two schedule sources?

**Byga** is the official league platform but its schedule data lags during active scheduling periods. **GotSport** is the game-management system where schedules are entered first — its export endpoint is real-time. When they disagree, GotSport is the source of truth.

## Environment

Copy `.env.example` → `.env` and fill in values:

| Variable | Required | Description |
|----------|----------|-------------|
| `MCP_TRANSPORT` | No | `http` (default on server) or `stdio` |
| `PORT` | No | HTTP port (default: `3001`) |
| `LOG_LEVEL` | No | `debug` \| `info` \| `warn` \| `error` (default: `info`) |
| `BYGA_BASE_URL` | No | Base URL of the Byga instance — only needed if `get_field_availability` is ever enabled |
| `ENABLE_FIELD_AVAILABILITY` | No | Set to `true` to enable the Byga field tool (stdio only) |

## Build and start

From the repo root:

```bash
yarn build:server   # compiles TypeScript → server/dist/
yarn start          # runs server/dist/index.js
```

## Development

```bash
yarn dev:server     # runs with tsx — no build step needed
```
