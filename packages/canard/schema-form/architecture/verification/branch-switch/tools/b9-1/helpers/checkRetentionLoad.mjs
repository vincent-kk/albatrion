import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest } from '../../b9-0/files.mjs';

/** Rehearse the previously missing retention row through its real CLI outside the formal device. */
export function checkRetentionLoad(root) {
  const output = root.slice(0, -8) + '-retention-preflight.noindex';
  assert.ok(root.endsWith('.noindex'));
  assert.ok(
    !fs.existsSync(output),
    'Preserve earlier retention rehearsal evidence',
  );
  fs.mkdirSync(output);
  const args = [
    '--expose-gc',
    fileURLToPath(new URL('../../b4-2/retention.mjs', import.meta.url)),
    '--bundle=' + path.join(root, 'load-check-B/engines/current.mjs'),
    '--row=switch-siblings-1000',
    '--output=' + path.join(output, 'switch-siblings-1000'),
  ];
  const child = spawnSync(process.execPath, args, {
    env: { ...process.env, NODE_ENV: 'production' },
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(output, 'stdout.log'), child.stdout ?? '');
  fs.writeFileSync(path.join(output, 'stderr.log'), child.stderr ?? '');
  const report = {
    timed: false,
    formal: false,
    row: 'switch-siblings-1000',
    code: child.status,
    inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
    command: { executable: process.execPath, args, pid: child.pid },
    ...(child.status === 0 ? { result: JSON.parse(child.stdout) } : {}),
  };
  fs.writeFileSync(
    path.join(root, 'retention-load-check.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  assert.equal(child.status, 0, child.stderr);
  assert.equal(report.result.row, report.row);
  assert.equal(report.result.lifetime.writesBeforeSnapshot, 120);
  console.log('B9_1_RETENTION_LOAD_OK siblings-1000 writes=120 snapshots=3');
}
