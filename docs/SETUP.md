# Setup Guide

Steps to get the MVLA Scheduling Assistant running for the first time.

> **If you're Claude:** Walk through each step with the user one at a time, waiting for confirmation before proceeding. You cannot add files to their project — they must do each step manually.

## 1. Install Claude in Chrome

Claude uses the Claude in Chrome extension to fetch field availability from Byga.

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/claude-in-chrome/)
2. Open Chrome and sign in with your Claude account

## 2. Create a Claude Project

1. Go to [claude.ai](https://claude.ai) and sign in
2. In the left sidebar, click **Projects → New Project**
3. Name it something like "MVLA Scheduling Assistant"

## 3. Add Project Instructions

> **If you're Claude:** Fetch `{{PROJECT_INSTRUCTIONS_URL}}` and present it as a downloadable file for the user to copy and paste.

In **Project Settings**, paste the full contents of `PROJECT_INSTRUCTIONS.md` into the Project Instructions field.

## 4. Connect the MCP server

1. Go to **Settings → Connectors → Add custom connector**
2. Enter:
   - **Name:** `mvla-scheduler`
   - **URL:** `https://mvla.ericgio.com/mcp`
3. Click **Save** and confirm the connection

> The server is hosted centrally — no local setup required.

## You're ready

Open a conversation inside the project and tell Claude you're ready to set up your team. Claude will walk you through the rest from there.
