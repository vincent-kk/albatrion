// Spawned once per plain repeat or S9 diagnostic; fixture and clocks reuse IV-3-0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Session } from 'node:inspector/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { runBlocks } from '../iv-3-0/helpers/runBlocks.mjs';
import { sanitizeProfile } from '../iv-3-0/helpers/sanitizeProfile.mjs';
import { setupOperation } from '../iv-3-0/helpers/setupOperation.mjs';
import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';

const [root, lane, row, mode, repeatText] = process.argv.slice(2);
assert.equal(process.env.NODE_ENV, 'production');
assert.equal(process.versions.node.split('.')[0], '26');
assert.ok(
  ['A', 'B'].indexOf(lane) !== -1 &&
    ['plain', 'allocation', 'smoke'].indexOf(mode) !== -1,
);
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, lane, 'inputs.json'), 'utf8'),
);
assert.deepEqual(digest(path.join(root, lane, 'engine.mjs')), inputs.engine);
assert.equal(inputs.node, process.version);
const engine = await import(
  pathToFileURL(path.join(root, lane, 'engine.mjs')).href
);
const operation = await setupOperation(row, engine);
if (mode === 'smoke') {
  operation.run();
  operation.check();
  console.log('IV_4_SMOKE_OK ' + row);
} else {
  const switches = 20000,
    warmups = 2000;
  let blocks, sampling, profile, allocations;
  if (mode === 'allocation') {
    await runBlocks(operation, 0, warmups);
    const session = new Session();
    session.connect();
    sampling = {
      samplingInterval: 32768,
      includeObjectsCollectedByMajorGC: true,
      includeObjectsCollectedByMinorGC: true,
    };
    await session.post('HeapProfiler.startSampling', sampling);
    try {
      blocks = await runBlocks(
        { run: () => operation.run(), check() {} },
        switches,
        0,
      );
      ({ profile } = await session.post('HeapProfiler.stopSampling'));
    } finally {
      session.disconnect();
    }
    operation.check();
    const nodes = [],
      pending = [profile.head];
    while (pending.length) {
      const node = pending.pop();
      nodes.push(node);
      pending.push(...node.children);
    }
    sanitizeProfile(
      { nodes },
      fs.realpathSync(
        fileURLToPath(new URL('../../../../../../../../', import.meta.url)),
      ),
      root,
    );
    allocations = summarizeAllocations(profile, switches);
  } else blocks = await runBlocks(operation, switches, warmups);
  const result = {
    row,
    lane,
    repeat: Number(repeatText),
    collector: mode === 'allocation',
    switches,
    warmups,
    writesPerOperation: operation.writes,
    blocks,
    node: process.version,
    pid: process.pid,
    sampling,
    profile,
    allocations,
  };
  json(
    path.join(
      root,
      'raw.noindex',
      [row, lane, repeatText, mode].join('-') + '.json',
    ),
    result,
  );
  console.log('IV_4_ROW_OK ' + row + ' ' + lane + ' ' + mode);
}
