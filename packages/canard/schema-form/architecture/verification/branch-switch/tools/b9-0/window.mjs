// Authorized CLI owns the only formal window; each process is checked before starting.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sampleProcessCpu } from '../window/helpers/sampleProcessCpu.mjs';
import { waitForQuietProcess } from '../window/helpers/waitForQuietProcess.mjs';
import { digest, json, read, verifyInputs } from './files.mjs';
import { rows } from './rows.mjs';

const [rootText, authorized, pidText] = process.argv.slice(2);
assert.equal(authorized, '--authorized');
const root = path.resolve(rootText),
  agentPid = Number(pidText);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
assert.equal(Number(process.versions.node.split('.')[0]), 26);
verifyInputs(root);
assert.equal(read(path.join(root, 'build-verification.json')).identical, true);
const smoke = read(path.join(root, 'untimed-load-check.json'));
assert.equal(smoke.timed, false);
assert.equal(smoke.results.length, 7);
assert.equal(smoke.inputsSha256, digest(path.join(root, 'inputs.json')).sha256);
assert.ok(
  !fs.existsSync(path.join(root, 'formal-start.json')),
  'Never rerun a formal window',
);
fs.mkdirSync(path.join(root, 'cpu-prechecks'), { recursive: true });
fs.mkdirSync(path.join(root, 'processes'), { recursive: true });
const initial = await waitForQuietProcess({ agentPid });
json(path.join(root, 'quiet-window.json'), initial);
assert.ok(
  initial.approved,
  '458C-03 environment failure before formal samples',
);
json(path.join(root, 'formal-start.json'), {
  startedAt: new Date().toISOString(),
  agentPid,
  quality: 'legacy',
  smokeSha256: digest(path.join(root, 'untimed-load-check.json')).sha256,
});
console.log('B9_0_WINDOW_START');
const results = [];
try {
  for (let repeat = 0; repeat < 10; repeat++)
    for (const row of rows)
      for (const pass of ['ledger', 'supplemental', 'gap']) {
        const label = `${row.id}-${pass}-${repeat}`;
        const quiet = await waitForQuietProcess({ agentPid });
        json(path.join(root, 'cpu-prechecks', label + '.json'), quiet);
        assert.ok(quiet.approved, '458C-03 per-process external CPU timeout');
        const args = [
          fileURLToPath(new URL('./worker.mjs', import.meta.url)),
          root,
          row.id,
          pass,
          String(repeat),
        ];
        const out = fs.openSync(
          path.join(root, 'processes', label + '.json'),
          'w',
        );
        const err = fs.openSync(
          path.join(root, 'processes', label + '.stderr'),
          'w',
        );
        const child = spawn(process.execPath, args, {
          env: { ...process.env, NODE_ENV: 'production' },
          stdio: ['ignore', out, err],
        });
        const code = await new Promise((resolve, reject) => {
          child.on('error', reject);
          child.on('exit', resolve);
        });
        fs.closeSync(out);
        fs.closeSync(err);
        json(path.join(root, 'processes', label + '.command.json'), {
          row: row.id,
          pass,
          repeat,
          code,
        });
        assert.equal(code, 0, label + ' failed; preserve raw without rerun');
        results.push(read(path.join(root, 'processes', label + '.json')));
        console.log(`B9_0_PROGRESS ${results.length}/180 ${label}`);
      }
  json(path.join(root, 'results.json'), { completed: true, results });
} finally {
  json(path.join(root, 'window-end.json'), {
    endedAt: new Date().toISOString(),
    completedProcesses: results.length,
    processes: await sampleProcessCpu(3000),
  });
  verifyInputs(root);
}
console.log('B9_0_WINDOW_END');
