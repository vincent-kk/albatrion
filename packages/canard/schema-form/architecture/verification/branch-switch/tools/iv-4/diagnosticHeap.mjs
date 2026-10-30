// Diagnostic only: runs the window's unchanged Bun heap supplemental on frozen browser bundles.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import {
  observeMeasurementCpu,
  observeMeasurementStart,
} from './helpers/observeMeasurement.mjs';

const [manifest, agentText] = process.argv.slice(2);
const cases = JSON.parse(fs.readFileSync(manifest, 'utf8'));
const agentPid = Number(agentText);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
const output = path.join(path.dirname(manifest), 'heap.noindex');
assert.ok(!fs.existsSync(output));
fs.mkdirSync(output);
const quiet = await observeMeasurementStart(agentPid);
json(path.join(output, 'quiet.json'), quiet);
if (!quiet.approved) {
  json(path.join(output, 'failure.json'), { kind: 'environment-refusal' });
  process.exit(3);
}
const packageDir = fileURLToPath(
  new URL('../../../../../', import.meta.url),
);
const dist = path.join(packageDir, 'dist/index.mjs');
const original = fs.readFileSync(dist);
try {
  for (const item of cases) {
    assert.match(item.label, /^[A-Za-z0-9-]+$/);
    assert.deepEqual(digest(item.bundle), item.digest);
    fs.writeFileSync(dist, fs.readFileSync(item.bundle));
    json(
      path.join(output, item.label + '-cpu.json'),
      observeMeasurementCpu(agentPid),
    );
    const args = [
      'bench/legacy-compare/node-and-settle.bench.ts',
      '--heap-child',
    ];
    const child = spawnSync('bun', args, {
      cwd: packageDir,
      env: { ...process.env, NODE_ENV: 'production' },
      encoding: 'utf8',
      timeout: 59000,
    });
    fs.writeFileSync(
      path.join(output, item.label + '.stdout'),
      child.stdout ?? '',
    );
    fs.writeFileSync(
      path.join(output, item.label + '.stderr'),
      child.stderr ?? '',
    );
    json(path.join(output, item.label + '-receipt.json'), {
      label: item.label,
      head: item.head,
      bundle: item.digest,
      command: ['bun', ...args],
      status: child.status,
      signal: child.signal,
      execution: digest(fileURLToPath(import.meta.url)),
    });
    assert.equal(child.status, 0, child.stderr);
    const result = JSON.parse(child.stdout);
    json(path.join(output, item.label + '.json'), result);
    console.log(item.label + ' ' + result.new.bytesPerNode);
  }
} finally {
  fs.writeFileSync(dist, original);
}
console.log('IV_4_DIAGNOSTIC_HEAPS_COMPLETE');
