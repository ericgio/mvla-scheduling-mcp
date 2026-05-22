<div align="center">
  <img width="300" height="150" alt="mvla-claude" src="./mvla-claude.png" />
</div>

# MVLA Scheduling Assistant

A Claude-powered scheduling tool for MVLA team managers. It surfaces field availability, cross-references coach and personal calendars, and suggests optimal game slots — all from a plain-English chat interface.

## How does it work?

The tool is a [Claude.ai Project](https://claude.ai) — a persistent chat context that gives Claude access to your team's season info and a set of tools for fetching live data. When you ask it to schedule a game, it:

1. Fetches available field slots from Byga
2. Fetches your team's schedule and your coach's schedule
3. Cross-references your personal calendar for conflicts
4. Suggests 2–3 ranked options with reasoning

No code to run. No spreadsheets. Just a conversation.

## What do I need?

- A [Claude.ai](https://claude.ai) account (free tier works; Pro recommended for longer sessions)
- [Google Chrome](https://www.google.com/chrome/) with the [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/) extension installed

## Setup

To get started, go to https://mvla.ericgio.com/ and follow the instructions.

## Usage

Start a new chat inside your project and ask naturally:

> "Can you check field availability for the weekend of June 14–15?"

> "Schedule a home game against FC Ballistic — they can't do Saturdays."

> "What does our schedule look like for the rest of the season?"

Claude will fetch live data, flag any conflicts, and walk you through the options. On confirmation, it will draft a message to the away team manager ready to paste into GotSport.

## Current limitations

- **Field availability requires Claude in Chrome** — Claude opens a live browser tab to read Byga's field calendar. This is a temporary workaround until official Byga API access is granted.
- **One season at a time** — the season context doc is specific to a single team and season. Start a new doc each season.

## Feedback and contributions

This is a v0 built for a specific use case. If you're an MVLA manager using this and run into issues or have suggestions, please open a GitHub issue or reach out to me directly.
