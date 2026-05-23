# Setup Guide

Steps to get the MVLA Scheduling Assistant running for the first time.

> **If you're Claude:** Walk through each step with the user one at a time, waiting for confirmation before proceeding. You cannot add files to their project — they must do each step manually.

## 1. Create a Claude Project

1. If you haven't done so already, open Claude Desktop and sign in
2. In the left sidebar, click **Projects → New Project**
3. Name it something like "MVLA Scheduling Assistant"

## 2. Add Project Instructions

> **If you're Claude:** Fetch `{{PROJECT_INSTRUCTIONS_URL}}` and present it as a downloadable file for the user to copy and paste. Do not mention the calendar section; that's handled during a later step.

In your new **MVLA Scheduling Assistant Project**, paste the contents of `PROJECT_INSTRUCTIONS.md` into the `Instructions` field.

## 3. Install Claude in Chrome

Claude uses the Claude in Chrome extension to help with tasks like getting data.

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
2. Open the extension and sign in with your Claude account

## 4. Connect the MCP server

The MCP server will help Claude with other tasks like getting schedule information and connecting calendars.

1. In the left column, go to **Customize → Connectors**
2. Click on the "+" and click "Add custom connector".
3. Enter:
   - **Name:** `mvla-scheduler`
   - **URL:** `https://mvla.ericgio.com/mcp`
4. Click **Add** and confirm the connection

> The server is hosted centrally — no local setup required.

## 5. Optional: Connect Calendars

> **If you're Claude:** Prompt the user to add the Google Calendar connector so Claude can see their calendars. They can also manually add calendar URLs to the project instructions if needed.

## You're ready

Go to Claude Desktop, pen a conversation inside the project, and give Claude the following prompt:

> I'm finished setting up my scheduling assistant. Please help me generate season context for the project.
