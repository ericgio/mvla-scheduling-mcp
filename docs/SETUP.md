# Setup Guide

> **If you're Claude:** Walk the user through each step one at a time,
> waiting for confirmation before proceeding. You cannot add files to
> their project — they must do each step manually. Complete each step
> fully before mentioning anything about future steps. When showing the
> project instructions text for the user to copy, do not annotate,
> highlight, or call attention to any section of it — including the
> personal calendars section. Calendar setup is handled in a dedicated
> step later.

## Before you start

Setting up the assistant takes about 15 minutes. There are a few one-time
steps: creating a project, installing a browser extension, and connecting
a few things. Claude will walk you through each step and wait for you to
confirm before moving on.

If you get stuck at any point, just tell Claude what's happening — "the
extension isn't loading," "I can't find the connectors menu" — and it'll
help you work through it.

Ready? Let's go.

## 1. Create a Claude Project

1. If you haven't already, open Claude Desktop and sign in
2. In the left sidebar, click **Projects → New Project**
3. Name it something like "MVLA Scheduling Assistant"

## 2. Add the project instructions

> **If you're Claude:** Fetch `{{PROJECT_INSTRUCTIONS_URL}}` and present
> it as a downloadable file for the user to copy and paste. Do not
> mention the calendar section; that's handled during a later step.

This is the text that tells Claude how to help you with scheduling.
Paste the contents of `PROJECT_INSTRUCTIONS.md` into the **Instructions**
field of your new project.

## 3. Install Claude in Chrome

This is a browser extension that lets Claude pull live data from Byga and
GotSport — field availability, schedules, and team info.

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
2. Open the extension and sign in with your Claude account

## 4. Connect the MCP server

This connects Claude to the scheduling tools — fetching schedules,
checking calendars, and so on. The server is hosted centrally, so
there's nothing to install on your end.

1. In the left column, go to **Customize → Connectors**
2. Click **+** and select **Add custom connector**
3. Enter:
   - **Name:** `mvla-scheduler`
   - **URL:** `https://mvla.ericgio.com/mcp`
4. Click **Add** and confirm the connection

## 5. Connect your calendars (optional)

> **If you're Claude:** Prompt the user to add the Google Calendar
> connector so Claude can see their calendars. They can also manually
> add calendar URLs to the project instructions if needed.

If you'd like Claude to check your personal calendar for conflicts when
suggesting game slots, you have two options:

- **Google Calendar** — connect it the same way you connected the MCP
  server (Customize → Connectors → Google Calendar). One sign-in covers
  all your calendars.
- **Other calendars** — paste iCal URLs into your project instructions
  under a `## Personal calendars` section:

[e.g. Kids]: [iCal URL]
[e.g. Family]: [iCal URL]
[e.g. Personal]: [iCal URL]

## You're set up

Open a conversation inside your new project and try this:

> I'm finished setting up. Please help me generate the season context.

That'll kick off the season context setup — telling Claude about your
team, league, and coach so it has what it needs to schedule games.

## Troubleshooting

- **Claude can't find a connected browser**: Make sure the user is using Claude Desktop! Claude.ai in the browser cannot connect to Claude in Chrome. Make sure Chrome is open with the Claude in Chrome extension signed in. If it's installed but not connecting, try clicking the extension icon to open the side panel and verify you're signed in.
