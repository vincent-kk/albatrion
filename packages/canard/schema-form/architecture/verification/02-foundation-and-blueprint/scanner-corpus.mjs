import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { JSONSchemaScanner } from '@winglet/json-schema/scanner';
import { getValue } from '@winglet/json/pointer';

import { corpus } from '../../spikes/guard-cost/redteam3/corpus.mjs';

// Run from the schema-form workspace; this measures the installed workspace scanner.
const results = [];
for (const sample of corpus) {
  const before = JSON.stringify(sample.root);
  const references = [];
  let visited = 0;
  const started = performance.now();
  new JSONSchemaScanner({
    options: { resolveReference: (reference) => getValue(sample.root, reference) },
    visitor: {
      exit(entry) {
        visited += 1;
        if (entry.hasReference || entry.referenceResolved) references.push({
          path: entry.path,
          referencePath: entry.referencePath,
          referenceSkipped: entry.referenceSkipped,
          referenceResolved: entry.referenceResolved,
        });
      },
    },
  }).scan(sample.root).getValue();
  assert.equal(JSON.stringify(sample.root), before, sample.id);
  results.push({ id: sample.id, visited, milliseconds: performance.now() - started, references });
}
assert.equal(results.length, 14);
assert.ok(results.some((result) => result.references.some((reference) => reference.referenceSkipped === 'cycle')));
assert.ok(results.some((result) => result.references.some((reference) => reference.referencePath && reference.referenceResolved)));
console.log(JSON.stringify({ node: process.version, scannerOnly: true, results }, null, 2));
