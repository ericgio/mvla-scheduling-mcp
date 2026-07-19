import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadProjectEnv, sendFailureSummaryEmail } from './daily-failure-summary.js';

test('loads Resend config from a project dotenv file', () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'mvla-summary-'));
  writeFileSync(path.join(tempDir, '.env'), 'RESEND_API_KEY=from-file\nFAILURE_SUMMARY_EMAIL_TO=ops@example.com\n');
  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.FAILURE_SUMMARY_EMAIL_TO;
    loadProjectEnv(tempDir);
    assert.equal(process.env.RESEND_API_KEY, 'from-file');
    assert.equal(process.env.FAILURE_SUMMARY_EMAIL_TO, 'ops@example.com');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('sends failure summary via Resend', async () => {
  let captured;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'mail_123' }),
    };
  };

  await sendFailureSummaryEmail(
    'Subject line',
    ['alerts@example.com'],
    'alerts@resend.dev',
    'test-key',
  );

  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer test-key');
  assert.deepEqual(captured.options.body, JSON.stringify({
    from: 'alerts@resend.dev',
    to: ['alerts@example.com'],
    subject: 'Subject line',
    text: 'Subject line',
  }));
});
