// One CLI process per bundle checks all six rows without clock reads.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { setupWrite } from './operation.mjs';
import { rows } from './rows.mjs';
import { createUntimedRecorder } from './untimedRecorder.mjs';

process.env.NODE_ENV = 'production';
const [root, file, mode] = process.argv.slice(2);
const recorder = createUntimedRecorder();
globalThis.__b0 = recorder;
globalThis.__b9diagnostic = { staticReuserCalls: 0 };
const mod = await import(pathToFileURL(path.join(root, file)).href);
const checked = [];
for (const row of rows) {
  recorder.enabled = false;
  const operation = await setupWrite(row, mod, mode === 'legacy');
  recorder.reset();
  recorder.enabled = true;
  for (let i = 0; i < 2; i++) {
    operation.write();
    if (mode === 'legacy') await operation.settle();
    operation.check();
  }
  checked.push({
    row: row.id,
    operations: 2,
    passed: true,
    counts: recorder.metrics,
  });
}
console.log(
  JSON.stringify({ mode, pid: process.pid, timed: false, rows: checked }),
);
