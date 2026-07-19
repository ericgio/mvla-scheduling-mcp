#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

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

if (failures.length === 0) {
  if (process.env.FAILURE_SUMMARY_ALL_CLEAR === 'true') {
    console.log('MVLA MCP failure summary: no failures detected in the last 24h');
  }
  process.exit(0);
}

const uniqueTools = [...new Set(failures.map((entry) => entry.tool))];
const summary = [
  'MVLA MCP failure summary',
  `Failures in the last 24h: ${failures.length}`,
  `Tools: ${uniqueTools.join(', ')}`,
  'Errors:',
  ...failures.map((entry) => `- [${entry.tool}] ${entry.error}`),
].join('\n');

const recipients = (process.env.FAILURE_SUMMARY_EMAIL_TO ?? '').split(',').map((item) => item.trim()).filter(Boolean);
if (recipients.length > 0) {
  const from = process.env.FAILURE_SUMMARY_EMAIL_FROM ?? 'mvla-scheduler@localhost';
  const message = `From: ${from}\nTo: ${recipients.join(', ')}\nSubject: MVLA MCP failure summary\n\n${summary}\n`;
  try {
    execFileSync('sendmail', ['-t'], { input: message, stdio: 'pipe' });
  } catch (error) {
    console.error('Unable to send failure summary via sendmail:', error instanceof Error ? error.message : String(error));
    console.log(summary);
  }
} else {
  console.log(summary);
}
