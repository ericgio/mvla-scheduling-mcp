import test from 'node:test';
import assert from 'node:assert/strict';
import { withToolLogging } from '../src/lib/tool-logging.js';

test('withToolLogging emits a single success JSON line', async () => {
  const lines: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.join(' '));
  };

  try {
    const result = await withToolLogging('get_gotsport_schedule', { event_id: '123', team_id: '456' }, async () => ({ ok: true }));

    assert.deepEqual(result, { ok: true });
    assert.equal(lines.length, 1);
    const entry = JSON.parse(lines[0]);
    assert.equal(entry.tool, 'get_gotsport_schedule');
    assert.deepEqual(entry.params, { event_id: '123', team_id: '456' });
    assert.equal(entry.success, true);
    assert.equal(entry.error, undefined);
    assert.equal(typeof entry.duration_ms, 'number');
  } finally {
    console.log = originalLog;
  }
});

test('withToolLogging emits a single failure JSON line', async () => {
  const lines: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.join(' '));
  };

  try {
    await assert.rejects(
      () =>
        withToolLogging('get_calendar_schedule', { url: 'https://example.com' }, async () => {
          throw new Error('boom');
        }),
      /boom/,
    );

    assert.equal(lines.length, 1);
    const entry = JSON.parse(lines[0]);
    assert.equal(entry.tool, 'get_calendar_schedule');
    assert.deepEqual(entry.params, { url: 'https://example.com' });
    assert.equal(entry.success, false);
    assert.equal(entry.error, 'boom');
  } finally {
    console.log = originalLog;
  }
});
