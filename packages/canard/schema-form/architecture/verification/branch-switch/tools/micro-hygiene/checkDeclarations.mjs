// Compare the complete declaration graph, preserving the raw A/B bytes for every change.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { normalizeDeclaration } from './helpers/normalizeDeclaration.mjs';

const [baseline, candidate, output] = process.argv
  .slice(2)
  .map((value) => path.resolve(value));
assert.ok(baseline && candidate && output);
const list = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? list(path.join(directory, entry.name))
        : entry.name.endsWith('.d.ts')
          ? [path.join(directory, entry.name)]
          : [],
    );
const roots = [baseline, candidate].map((directory) =>
  path.join(directory, 'dist'),
);
const lists = roots.map((directory) =>
  list(directory)
    .map((file) => path.relative(directory, file))
    .sort(),
);
assert.deepEqual(
  lists[0],
  lists[1],
  'Declaration graph addresses remain identical',
);
const changed = [],
  differences = [];
for (const file of lists[0]) {
  const [A, B] = roots.map((directory) =>
    fs.readFileSync(path.join(directory, file), 'utf8'),
  );
  if (A === B) continue;
  changed.push({ file, A, B });
  if (normalizeDeclaration(A, file) !== normalizeDeclaration(B, file))
    differences.push(file);
}
const index = fs.readFileSync(path.join(roots[1], 'index.d.ts'));
const baselineIndex = fs.readFileSync(path.join(roots[0], 'index.d.ts'));
const report = {
  baselineFiles: lists[0].length,
  candidateFiles: lists[1].length,
  changedFiles: changed.length,
  normalizedDifferences: differences,
  byteDiff: changed.map((record) => record.file),
  index: {
    bytes: index.length,
    sha256: createHash('sha256').update(index).digest('hex'),
    byteDifference: baselineIndex.equals(index) ? 0 : 'changed',
  },
  method:
    'Expand the proven Dictionary/Nullable/Optional/Nullish aliases (named and inline imports), flatten/order unions, omit comments, sort type imports; preserve every other AST node',
};
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(
  path.join(output, 'declaration-equivalence.json'),
  JSON.stringify(report, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(output, 'declaration-diff.json.gz'),
  gzipSync(JSON.stringify(changed) + '\n'),
);
assert.equal(
  differences.length,
  0,
  'No declaration difference after proven alias expansion',
);
console.log(
  'MICRO_DECLARATION_GRAPH_EQUIVALENT ' +
    report.baselineFiles +
    ' changed=' +
    report.changedFiles,
);
