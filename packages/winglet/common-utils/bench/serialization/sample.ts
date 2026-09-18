import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { performance } from 'node:perf_hooks';

import { parseGraph, stringifyGraph } from '../../src/utils/object';
import { type MeasurementCase, createCases } from './cases';
import {
  parseDenseExperiment,
  stringifyDenseExperiment,
} from './denseExperiment';
import { createFixture, fixtureNames } from './fixtures';

/** Loaded by the raw benchmark runner; argv[2] identifies an independent process. */
const processId = process.argv[2] ?? '0';
const require = createRequire(import.meta.url);
const flatted = require('flatted');
const ungap = require('@ungap/structured-clone');
const directory =
  'packages/winglet/common-utils/bench/.results/serialization-consolidation-prefix';
mkdirSync(directory, { recursive: true });
const rows: any[] = [];
let checksum = 0;

/** Consumes observable output outside timing, preserving result liveness. */
function consume(result: unknown): void {
  if (typeof result === 'string')
    checksum =
      (checksum + result.length + result.charCodeAt(result.length >> 1)) >>> 0;
  else if (result && typeof result === 'object')
    checksum = (checksum + Object.keys(result).length) >>> 0;
  else checksum = (checksum + 1) >>> 0;
}

/** Captures individual batch averages; setup and GC never enter operation timing. */
function measure(
  candidate: MeasurementCase,
  fixture: string,
  sample: number,
): void {
  const batch =
    fixture === 'limit'
      ? 1
      : fixture === 'dense' || fixture === 'wide' || fixture === 'deep'
        ? 4
        : 20;
  const setupStart = performance.now();
  const runs = Array.from({ length: batch }, () => candidate.prepare());
  const setupMs = performance.now() - setupStart;
  let result: unknown;
  const start = performance.now();
  for (const run of runs) result = run();
  const elapsed = performance.now() - start;
  consume(result);
  rows.push({
    fixture,
    name: candidate.name,
    contract: candidate.contract,
    sample,
    batch,
    us: (elapsed * 1000) / batch,
    setupMs,
    outputBytes: typeof result === 'string' ? Buffer.byteLength(result) : null,
  });
}

for (const fixture of fixtureNames) {
  const value = createFixture(fixture);
  assert.deepStrictEqual(parseGraph(stringifyGraph(value)), value);
  let candidates = createCases(fixture);
  if (['dense', 'sparse', 'dag', 'tree'].includes(fixture)) {
    const denseText = stringifyDenseExperiment(value);
    assert.deepStrictEqual(parseDenseExperiment(denseText), value);
    candidates.push(
      {
        name: 'dense-experiment-encode',
        contract: 'experimental-wire-adapter',
        prepare: () => () => stringifyDenseExperiment(value),
      },
      {
        name: 'dense-experiment-parse',
        contract: 'experimental-wire-adapter',
        prepare: () => () => parseDenseExperiment(denseText),
      },
      {
        name: 'dense-experiment-roundtrip',
        contract: 'experimental-wire-adapter',
        prepare: () => () =>
          parseDenseExperiment(stringifyDenseExperiment(value)),
      },
    );
  }
  if (fixture === 'limit')
    candidates = candidates.filter(({ name }) =>
      ['stringifyGraph', 'parseGraph', 'graph-roundtrip'].includes(name),
    );
  if (['small', 'cycle', 'dag', 'tree'].includes(fixture)) {
    const flat = flatted.stringify(value);
    assert.deepStrictEqual(flatted.parse(flat), value);
    candidates.push(
      {
        name: 'flatted-stringify',
        contract: 'json-reference-subset',
        prepare: () => () => flatted.stringify(value),
      },
      {
        name: 'flatted-parse',
        contract: 'json-reference-subset',
        prepare: () => () => flatted.parse(flat),
      },
    );
  }
  if (fixture === 'small' || fixture === 'cycle') {
    const encoded = JSON.stringify(ungap.serialize(value));
    assert.deepStrictEqual(ungap.deserialize(JSON.parse(encoded)), value);
    candidates.push(
      {
        name: 'ungap-stringify',
        contract: 'structured-clone-json-subset',
        prepare: () => () => JSON.stringify(ungap.serialize(value)),
      },
      {
        name: 'ungap-parse',
        contract: 'structured-clone-json-subset',
        prepare: () => () => ungap.deserialize(JSON.parse(encoded)),
      },
    );
  }
  for (const candidate of candidates)
    for (let warm = 0; warm < 5; warm++) consume(candidate.prepare()());
  for (let sample = 0; sample < 30; sample++) {
    const order =
      (sample + Number(processId)) % 2 ? [...candidates].reverse() : candidates;
    for (const candidate of order) measure(candidate, fixture, sample);
  }
}
const invalid = JSON.stringify([
  'winglet.graph',
  1,
  ['null'],
  [
    ['array', 600000, []],
    ['array', 600000, []],
  ],
]);
for (const [name, run] of [
  ['reject-limit', () => parseGraph(invalid)],
  ['reject-unsupported', () => stringifyGraph(() => 1)],
  ['reject-malformed', () => parseGraph('[1]')],
] as const) {
  const reject = () => {
    try {
      run();
    } catch (error) {
      assert.ok(error instanceof TypeError);
      return 'rejected';
    }
    throw new Error('Expected rejection');
  };
  for (let sample = 0; sample < 30; sample++)
    measure(
      { name, contract: 'error-path', prepare: () => reject },
      'error',
      sample,
    );
}
const memory: any[] = [];
for (const fixture of ['small', 'dense', 'sparse', 'extended', 'limit']) {
  for (const candidate of createCases(fixture).filter(({ name }) =>
    [
      'stringifyGraph',
      'parseGraph',
      'createFingerprint',
      'factory-create',
      'factory-mutable',
      'factory-immutable-hit',
    ].includes(name),
  )) {
    global.gc?.();
    const before = process.memoryUsage();
    const result = candidate.prepare()();
    const after = process.memoryUsage();
    consume(result);
    memory.push({
      fixture,
      name: candidate.name,
      heapDelta: after.heapUsed - before.heapUsed,
      rssDelta: after.rss - before.rss,
      explicitGC: !!global.gc,
    });
  }
}
const metadata = {
  processId,
  node: process.version,
  v8: process.versions.v8,
  os: `${os.platform()} ${os.release()} ${os.arch()}`,
  cpu: os.cpus()[0].model,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim(),
  fixtures: Object.fromEntries(
    fixtureNames.map((name) => [
      name,
      createHash('sha256')
        .update(stringifyGraph(createFixture(name)))
        .digest('hex'),
    ]),
  ),
  versions: {
    flatted: require('flatted/package.json').version,
    ungap: require('@ungap/structured-clone/package.json').version,
  },
  checksum,
  peakRssKiB: process.resourceUsage().maxRSS,
  browser: 'unmeasured',
  newerV8: 'unmeasured',
};
writeFileSync(
  `${directory}/process-${processId}.json`,
  JSON.stringify({ metadata, rows, memory }, null, 2),
);
console.log(
  `SERIALIZATION_SAMPLES_OK process=${processId} rows=${rows.length} checksum=${checksum}`,
);
