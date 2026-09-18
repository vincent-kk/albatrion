import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { performance } from 'node:perf_hooks';

import { createFixture } from '../../../../../bench/serialization/fixtures';
import { serializeObject } from '../../serializeObject';
import { serializeWithFullSortedKeys } from '../../serializeWithFullSortedKeys';
import { stableSerialize } from '../../stableSerialize';
import { createFingerprintFactory, createSafeFingerprint } from '../index';
import { compact, compactFactory } from './compact';
import { direct as directWriter } from './direct';
import { hash32 } from './hash';
import { legacyFactory, legacyFingerprint } from './legacy';

// "current" now measures the public safe API; archived graph-key runs are a different baseline.
const processId = Number(process.argv[2] ?? 0);
const fixtures = [
  'scalar',
  'small',
  'wide',
  'schema',
  'deep',
  'dense',
  'sparse',
  'cycle',
  'dag',
  'tree',
  'extended',
  'escaping',
];
const rows: any[] = [];
let checksum = 0;
type Candidate = { name: string; prepare: () => () => string };
for (const fixture of fixtures) {
  const value = createFixture(fixture);
  const factory = createFingerprintFactory();
  const immutable = createFingerprintFactory({ cache: 'immutable' });
  const direct = compactFactory();
  const cached = compactFactory({ cache: 'immutable' });
  const legacyMutable = legacyFactory();
  const legacyCached = legacyFactory(true);
  const omit = ['secret', 'name'];
  const stableOmitValue = createFixture(fixture);
  const candidates: Candidate[] = [];
  const add = (name: string, run: () => string) =>
    candidates.push({ name, prepare: () => run });
  add('current', () => createSafeFingerprint(value));
  add('compact-strict', () => compact(value));
  add('compact-no-byte-scan', () =>
    compact(value, undefined, undefined, false, false),
  );
  add('compact-trusted', () => compact(value, undefined, undefined, true));
  add('direct-strict', () => directWriter(value));
  add('direct-trusted', () => directWriter(value, true));
  add('hash32-checked', () => hash32(value));
  add('hash32-trusted', () => hash32(value, true));
  add('legacy-shaped-pure', () => legacyFingerprint(value));
  add('legacy-shaped-factory', () => legacyMutable(value));
  add('legacy-shaped-cache-hit', () => legacyCached(value));
  add('current-factory', () => factory(value));
  add('compact-factory', () => direct(value));
  add('current-cache-hit', () => immutable(value));
  add('compact-cache-hit', () => cached(value));
  add('stable-warm', () => stableSerialize(value));
  candidates.push({
    name: 'stable-cold',
    prepare: () => {
      const fresh = createFixture(fixture);
      return () => stableSerialize(fresh);
    },
  });
  for (const [name, encode] of [
    ['current-cold', createSafeFingerprint],
    ['legacy-shaped-cold', legacyMutable],
    ['compact-cold', compact],
    ['direct-cold', directWriter],
  ] as const)
    candidates.push({
      name,
      prepare: () => {
        const fresh = createFixture(fixture);
        return () => encode(fresh);
      },
    });
  add('full-sorted', () => serializeWithFullSortedKeys(value));
  add('current-omit', () => createSafeFingerprint(value, { omit }));
  add('compact-omit', () => compact(value, { omit }));
  add('stable-omit-warm', () => stableSerialize(stableOmitValue, omit));
  add('compact-omit-cache-hit', () => cached(value, { omit }));
  if (!['cycle', 'extended'].includes(fixture)) {
    add('serializeObject', () => serializeObject(value));
    add('JSON.stringify', () => JSON.stringify(value));
  }
  const encoded = compact(value);
  assert.equal(encoded, compact(createFixture(fixture)));
  const batch = ['small', 'scalar', 'escaping'].includes(fixture) ? 200 : 20;
  for (const candidate of candidates) {
    for (let warm = 0; warm < 100; warm++)
      checksum ^= candidate.prepare()().length;
  }
  for (const mode of ['generate', 'lookup']) {
    const lookups = new Map(
      candidates.map((candidate) => [
        candidate.name,
        new Map([[candidate.prepare()(), 1]]),
      ]),
    );
    for (let sample = 0; sample < 30; sample++) {
      const offset = (sample * 7 + processId * 3) % candidates.length;
      const order = [
        ...candidates.slice(offset),
        ...candidates.slice(0, offset),
      ];
      if ((sample + processId) % 2) order.reverse();
      for (const candidate of order) {
        const runs = Array.from({ length: batch }, () => candidate.prepare());
        const lookup = lookups.get(candidate.name)!;
        let result = '',
          consumed = 0;
        const start = performance.now();
        if (mode === 'generate') {
          for (const run of runs) {
            result = run();
            consumed += result.length;
          }
        } else {
          for (const run of runs) {
            result = run();
            consumed += lookup.get(result) ?? 0;
          }
        }
        const us = ((performance.now() - start) * 1000) / batch;
        checksum =
          (checksum + consumed + result.charCodeAt(result.length >> 1)) >>> 0;
        rows.push({
          fixture,
          mode,
          name: candidate.name,
          sample,
          batch,
          us,
          bytes: Buffer.byteLength(result),
          lookupHits: mode === 'lookup' ? consumed : undefined,
        });
      }
    }
  }
}
const metadata = {
  baseline: 'public-safe-fingerprint',
  processId,
  node: process.version,
  v8: process.versions.v8,
  cpu: os.cpus()[0].model,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim(),
  checksum,
  sourceHashes: Object.fromEntries(
    ['compact.ts', 'direct.ts', 'hash.ts', 'legacy.ts', 'sample.ts'].map(
      (name) => [
        name,
        createHash('sha256')
          .update(
            readFileSync(
              'packages/winglet/common-utils/src/utils/object/fingerprint/__bench__/' +
                name,
            ),
          )
          .digest('hex'),
      ],
    ),
  ),
};
writeFileSync(
  `.seiri/tasks/fingerprint-performance/process-${processId}.json`,
  JSON.stringify({ metadata, rows }, null, 2),
);
console.log(
  `FINGERPRINT_REVIEW_SAMPLES process=${processId} rows=${rows.length} checksum=${checksum}`,
);
