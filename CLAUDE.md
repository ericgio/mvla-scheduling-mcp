# MVLA Soccer Scheduling Assistant

A toolbox for youth soccer league managers to coordinate scheduling, check availability, and catch conflicts before they become problems. Built around the MVLA (Mountain View-Los Altos Soccer Club) competitive program but the tools are generic.

## Directory structure

```
mvla-scheduling-mcp/   Unified MCP server (TypeScript, Node)
season-context-template.md   Template for per-team season context
```

## MCP server — tools

The server lives in `mvla-scheduling-mcp/` and exposes three tools to Claude:

| Tool | Auth needed | Notes |
|------|-------------|-------|
| `get_gotsport_schedule` | None | GotSport XLSX export — real-time, no CAPTCHA |
| `get_calendar_schedule` | None | Any calendar subscription URL (.ics) — Google Calendar, Byga, Apple, etc. |
| `get_field_availability` | BYGA_COOKIE | Byga field slots. Local (stdio) only — disabled in HTTP mode |

Both schedule tools have a `force_refresh` flag to bypass the 5-minute cache and a `fetchedAt` timestamp in the response so Claude can reason about data freshness.

## Why two schedule sources?

**Byga** is the official league platform but its schedule data lags during active scheduling periods. **GotSport** is the game-management system where schedules are entered first — its export endpoint is real-time. When they disagree, GotSport is the source of truth.

## Setup

```bash
cd mvla-scheduling-mcp
npm install
npm run build
```

Then copy `.env.example` → `.env` and fill in Byga credentials. See `mvla-scheduling-mcp/README.md` for full setup instructions.

## Scheduling preferences

- Flag conflicts proactively — don't lead with good news
- Cross-reference all personal/family calendars for any date evaluation
- Surface holidays as soft considerations, don't auto-rule-out
