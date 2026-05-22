# mvla-scheduling-mcp

A unified MCP server for soccer scheduling assistants. Gives Claude real-time access to game schedules, team calendars, and field availability from a single server.

Runs locally over stdio (for Claude Desktop) or as an HTTP server (for shared/hosted use), controlled by an environment variable.

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `get_gotsport_schedule` | None | Fetches a team's schedule from GotSport via the public XLSX export endpoint |
| `get_calendar_schedule` | None | Fetches any calendar subscription URL (Google Calendar, Byga, .ics feeds) |
| `get_field_availability` | BYGA_COOKIE | Fetches field slot availability from Byga. Local (stdio) only — not available in HTTP mode |

`get_gotsport_schedule` and `get_calendar_schedule` both accept a `force_refresh` flag to bypass the 5-minute cache. Use it when you need current data (e.g. a game just finished, or a schedule was recently updated). The `fetchedAt` timestamp in every response tells you how fresh the data is.

## Setup

### 1. Install dependencies

```bash
cd mvla-scheduling-mcp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`. The only required values for `get_field_availability` are the Byga ones — the other two tools need no credentials.

**Getting your Byga session cookie (`BYGA_COOKIE`):**
1. Log into Byga in Chrome
2. Open DevTools (Cmd+Option+I) → Network tab
3. Navigate to your game schedule page in Byga
4. Click any request to your club's Byga domain
5. Headers → Request Headers → copy the full value of the `Cookie:` header
6. Paste it as `BYGA_COOKIE=...` in your `.env`

Session cookies expire every few days to weeks. If you see HTTP 401/403 errors, just refresh the cookie.

### 3. Build

```bash
npm run build
```

Output goes to `dist/`. Rebuild after any source changes.

### 4. Connect to Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "mvla-scheduling": {
      "command": "node",
      "args": ["--env-file=.env", "/absolute/path/to/mvla-scheduling-mcp/dist/index.js"]
    }
  }
}
```

Replace the path with the actual absolute path on your machine. Restart Claude Desktop.

### 5. HTTP mode (optional, for shared/hosted use)

```bash
MCP_TRANSPORT=http PORT=3001 node dist/index.js
```

In HTTP mode, `get_field_availability` is disabled (it requires a local session cookie). The other two tools work normally.

## Development

```bash
npm run dev    # runs with tsx, no build step needed
```

## Updating each season

1. Update `BYGA_SCHEDULE_ID` in `.env` with the new season's ID
2. Refresh `BYGA_COOKIE` if it has expired
3. Update your season context document with the new GotSport event/team IDs
