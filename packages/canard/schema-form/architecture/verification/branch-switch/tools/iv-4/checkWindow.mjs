// Exercise both Node preload and non-Node start branches with a synthetic heavy observation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runWindowProcess } from '../b9-1/helpers/runWindowProcess.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iv4-window-check-'));
const context = {
  here,
  root,
  agentPid: process.pid,
  repository: process.cwd(),
  continuousCpu: true,
  quietPreload: path.join(here, 'quietWorkerPreload.mjs'),
  observeCpu: () => ({
    gating: false,
    rows: [{ pid: 1, name: 'synthetic-heavy', cpuPercent: 99 }],
  }),
};
for (const [label, executable] of [
  ['node', process.execPath],
  ['other-executable', 'node'],
]) {
  const code = await runWindowProcess(context, label, executable, [
    path.join(here, '__tests__/fixtures/windowChild.mjs'),
  ]);
  assert.equal(code, 0);
  assert.match(
    fs.readFileSync(path.join(root, label + '.log'), 'utf8'),
    /IV4_WINDOW_CHILD_OK/,
  );
  const observed = JSON.parse(
    fs.readFileSync(path.join(root, 'cpu-' + label + '.json'), 'utf8'),
  );
  assert.equal(observed.rows[0].cpuPercent, 99);
  assert.equal(observed.gating, false);
}
const childRows = fs.readdirSync(path.join(root, 'cpu-prechecks'));
assert.ok(childRows.length > 0);
for (const file of childRows) {
  const row = JSON.parse(
    fs.readFileSync(path.join(root, 'cpu-prechecks', file), 'utf8'),
  );
  assert.equal(row.gating, false);
  assert.equal(row.kind, 'ps-reported-cpu');
}
console.log('IV4_CONTINUOUS_WINDOW_OK');
