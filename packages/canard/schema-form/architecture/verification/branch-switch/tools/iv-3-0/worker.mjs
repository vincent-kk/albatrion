// Loaded by profile.mjs in one Node process per row; only runBlocks' spans are attributed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { runBlocks } from './helpers/runBlocks.mjs';
import { setupOperation } from './helpers/setupOperation.mjs';

const [root, row, intervalText, mode] = process.argv.slice(2);
assert.equal(process.env.NODE_ENV, 'production');
const engine = await import(pathToFileURL(path.join(root, 'engine.mjs')).href);
const operation = await setupOperation(row, engine);
if (mode === 'smoke') {
  operation.run();
  operation.check();
  console.log('IV_3_0_SMOKE_OK ' + row);
} else {
  const switches = mode === 'rehearse' ? 1 : 20000;
  const warmups = mode === 'rehearse' ? 1 : 2000;
  const blocks = await runBlocks(operation, switches, warmups);
  fs.writeFileSync(
    path.join(root, 'raw.noindex', row + '-' + intervalText, 'wall.json'),
    JSON.stringify(
      {
        row,
        intervalUs: Number(intervalText),
        switches,
        warmups,
        writesPerSwitch: operation.writes,
        blocks,
        node: process.version,
        pid: process.pid,
      },
      null,
      2,
    ) + '\n',
  );
  console.log('IV_3_0_ROW_OK ' + row);
}
