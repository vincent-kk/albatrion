import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { performance } from 'node:perf_hooks';

import { createFixture } from '../../../../../bench/serialization/fixtures';
import {
  createFingerprint,
  createFingerprintFactory,
  createSafeFingerprint,
  createSortedFingerprint,
} from '../index';

/** Runs from the repository root; argv[2] identifies an independent benchmark process. */
const processId = Number(process.argv[2] ?? 0);
const directory = '.seiri/tasks/fingerprint-public';
mkdirSync(directory, { recursive: true });
const files = [
  'createFingerprint.ts',
  'createSortedFingerprint.ts',
  'createSafeFingerprint.ts',
  'createFingerprintFactory.ts',
  'utils/writeFastFingerprint.ts',
  'utils/writeSortedFingerprint.ts',
  'utils/createSafeWriter.ts',
  'utils/isOmitted.ts',
];
const sourceHashes = Object.fromEntries(
  files.map((name) => [
    name,
    createHash('sha256')
      .update(
        readFileSync(
          'packages/winglet/common-utils/src/utils/object/fingerprint/' + name,
        ),
      )
      .digest('hex'),
  ]),
);
const rows: any[] = [];
let checksum = 0;
let lastResult: unknown;
type Candidate = { name: string; prepare: () => () => unknown };
for (const fixture of [
  'small',
  'wide',
  'schema',
  'dense',
  'sparse',
  'deep',
  'cycle',
  'dag',
  'tree',
  'extended',
  'escaping',
]) {
  const value = createFixture(fixture);
  const safeSorted = createFingerprintFactory({ mode: 'safe', sort: true });
  const safeUnsorted = createFingerprintFactory({ mode: 'safe', sort: false });
  const safeCached = createFingerprintFactory({
    mode: 'safe',
    cache: 'immutable',
  });
  const sorted = createFingerprintFactory({ mode: 'sorted' });
  const fast = createFingerprintFactory({ mode: 'fast' });
  const candidates: Candidate[] = [];
  const add = (name: string, run: () => unknown) =>
    candidates.push({ name, prepare: () => run });
  const cold = (name: string, encode: (value: unknown) => unknown) =>
    candidates.push({
      name,
      prepare: () => {
        const fresh = createFixture(fixture);
        return () => encode(fresh);
      },
    });
  add('sorted', () => createSortedFingerprint(value));
  add('factory-sorted', () => sorted(value));
  add('safe-sort', () => createSafeFingerprint(value));
  add('safe-no-sort', () => createSafeFingerprint(value, { sort: false }));
  add('factory-safe-sort', () => safeSorted(value));
  add('factory-safe-no-sort', () => safeUnsorted(value));
  add('safe-cache-hit', () => safeCached(value));
  cold('safe-cold', createSafeFingerprint);
  cold('safe-unsorted-cold', (input) =>
    createSafeFingerprint(input, { sort: false }),
  );
  const omitted = ['secret', 'name'];
  add('safe-omit', () => createSafeFingerprint(value, { omit: omitted }));
  add('sorted-omit', () => createSortedFingerprint(value, { omit: omitted }));
  add('safe-prefix', () => createSafeFingerprint(value, { prefix: 'app:' }));
  for (const mode of ['fast', 'sorted', 'safe'] as const)
    add('factory-' + mode + '-create', () =>
      createFingerprintFactory({ mode }),
    );
  if (!['cycle', 'extended'].includes(fixture)) {
    add('fast', () => createFingerprint(value));
    add('factory-fast', () => fast(value));
    add('fast-prefix', () => createFingerprint(value, { prefix: 'app:' }));
    for (const [label, omit] of [
      ['small', omitted],
      ['large', Array.from({ length: 128 }, (_, i) => 'field' + i)],
    ] as const) {
      add('fast-omit-' + label, () => createFingerprint(value, { omit }));
    }
  }
  const batch = fixture === 'small' || fixture === 'escaping' ? 200 : 20;
  for (const candidate of candidates)
    for (let i = 0; i < 100; i++) lastResult = candidate.prepare()();
  for (const phase of ['generate', 'lookup']) {
    const lookups = new Map(
      candidates.map((c) => [c.name, new Map([[c.prepare()(), 1]])]),
    );
    for (let sample = 0; sample < 30; sample++) {
      const offset = (sample * 7 + processId * 3) % candidates.length;
      const order = [
        ...candidates.slice(offset),
        ...candidates.slice(0, offset),
      ];
      if ((sample + processId) % 2) order.reverse();
      for (const candidate of order) {
        if (phase === 'lookup' && candidate.name.endsWith('-create')) continue;
        const runs = Array.from({ length: batch }, () => candidate.prepare());
        const lookup = lookups.get(candidate.name)!;
        let result: unknown,
          consumed = 0;
        const start = performance.now();
        if (phase === 'generate')
          for (const run of runs) {
            result = run();
            consumed += typeof result === 'string' ? result.length : 1;
          }
        else
          for (const run of runs) {
            result = run();
            consumed += lookup.get(result) ?? 0;
          }
        const us = ((performance.now() - start) * 1000) / batch;
        lastResult = result;
        checksum = (checksum + consumed) >>> 0;
        rows.push({
          fixture,
          phase,
          name: candidate.name,
          sample,
          us,
          batch,
          bytes: typeof result === 'string' ? Buffer.byteLength(result) : null,
          hits: phase === 'lookup' ? consumed : undefined,
        });
      }
    }
  }
}
writeFileSync(
  directory + '/process-' + processId + '.json',
  JSON.stringify(
    {
      metadata: {
        processId,
        node: process.version,
        v8: process.versions.v8,
        cpu: os.cpus()[0].model,
        sourceHashes,
        checksum,
        resultType: typeof lastResult,
      },
      rows,
    },
    null,
    2,
  ),
);
console.log('FINGERPRINT_PUBLIC_SAMPLES', processId, rows.length, checksum);
