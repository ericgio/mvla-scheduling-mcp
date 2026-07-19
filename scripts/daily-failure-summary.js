#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

export function loadProjectEnv(baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const resolvedBase = path.resolve(baseDir);
  const candidates = [
    path.join(resolvedBase, '.env'),
    path.join(resolvedBase, 'server', '.env'),
    path.join(resolvedBase, '..', '.env'),
    path.join(resolvedBase, '..', 'server', '.env'),
    path.join(process.cwd(), '.env'),
  ];

  const seen = new Set();
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (seen.has(resolved)) {
      continue;
    }
    seen.add(resolved);
    if (existsSync(resolved)) {
      loadEnv({ path: resolved });
      return resolved;
    }
  }

  return null;
}

loadProjectEnv();

const oneDayMs = 24 * 60 * 60 * 1000;
const now = Date.now();
const cutoff = now - oneDayMs;
const candidateDirs = [
  process.env.PM2_LOG_DIR,
  process.env.PM2_LOGS_DIR,
  path.join(homedir(), '.pm2', 'logs'),
  path.join('/root', '.pm2', 'logs'),
  path.join('/var', 'www', '.pm2', 'logs'),
].filter(Boolean);

function findLogFiles(baseDir) {
  if (!baseDir || !existsSync(baseDir)) {
    return [];
  }

  const results = [];
  const entries = readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findLogFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.log')) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseTimestamp(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function collectFailures() {
  const logFiles = [...new Set(candidateDirs.flatMap(findLogFiles))];
  const failures = [];

  for (const logFile of logFiles) {
    const contents = readFileSync(logFile, 'utf8');
    const lines = contents.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch {
        continue;
      }

      if (parsed?.success !== false) {
        continue;
      }

      const timestamp = parseTimestamp(parsed?.timestamp);
      if (timestamp === null || timestamp < cutoff) {
        continue;
      }

      failures.push({
        tool: parsed?.tool ?? 'unknown',
        error: parsed?.error ?? 'unknown error',
        timestamp: parsed?.timestamp ?? 'unknown',
      });
    }
  }

  return failures;
}

export async function sendFailureSummaryEmail(
  subject,
  recipients,
  from,
  apiKey,
  text,
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text: text ?? subject,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function run() {
  const failures = collectFailures();

  if (failures.length === 0) {
    if (process.env.FAILURE_SUMMARY_ALL_CLEAR === 'true') {
      console.log(
        'MVLA MCP failure summary: no failures detected in the last 24h',
      );
    }
    return;
  }

  const uniqueTools = [...new Set(failures.map((entry) => entry.tool))];
  const summary = [
    'MVLA MCP failure summary',
    `Failures in the last 24h: ${failures.length}`,
    `Tools: ${uniqueTools.join(', ')}`,
    'Errors:',
    ...failures.map((entry) => `- [${entry.tool}] ${entry.error}`),
  ].join('\n');

  const recipients = (process.env.FAILURE_SUMMARY_EMAIL_TO ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (recipients.length > 0) {
    const from =
      process.env.FAILURE_SUMMARY_EMAIL_FROM ??
      process.env.RESEND_FROM_ADDRESS ??
      'onboarding@resend.dev';
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        'Unable to send failure summary via Resend: RESEND_API_KEY is not set',
      );
      console.log(summary);
      return;
    }

    try {
      await sendFailureSummaryEmail(
        'MVLA MCP failure summary',
        recipients,
        from,
        apiKey,
        summary,
      );
    } catch (error) {
      console.error(
        'Unable to send failure summary via Resend:',
        error instanceof Error ? error.message : String(error),
      );
      console.log(summary);
    }
  } else {
    console.log(summary);
  }
}

const entrypointPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : null;
if (entrypointPath && fileURLToPath(import.meta.url) === entrypointPath) {
  await run();
}
