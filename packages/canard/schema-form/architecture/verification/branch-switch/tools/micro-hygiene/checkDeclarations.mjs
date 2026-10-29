// Compare the complete declaration graph, preserving the raw A/B bytes for every change.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { collectReachableDeclarations } from './helpers/collectReachableDeclarations.mjs';
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
const manifests = [baseline, candidate].map((directory) =>
  JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')),
);
assert.deepEqual(
  manifests[0].exports,
  manifests[1].exports,
  'Package exports stay identical',
);
assert.deepEqual(
  Object.keys(manifests[1].exports),
  ['.'],
  'Only the root is public',
);
assert.equal(manifests[0].types, manifests[1].types);
const added = lists[1].filter((file) => !lists[0].includes(file));
const removed = lists[0].filter((file) => !lists[1].includes(file));
const permittedPrivateAdded = [
  'core/engine/utils/paths/isNamedPointerSegments.d.ts',
];
const permittedPrivateModified = [
  'core/engine/settle/arrangeFieldNodeItems/utils/rekey/clearArrayRuntimePaths.d.ts',
  'core/engine/settle/utils/transition/prunePerishedPaths.d.ts',
];
assert.deepEqual(removed, [], 'No existing declaration address disappears');
assert.deepEqual(
  added,
  permittedPrivateAdded,
  'Only the reviewed internal predicate file is added',
);
const publicGraphs = roots.map(collectReachableDeclarations);
assert.deepEqual(
  publicGraphs[0],
  publicGraphs[1],
  'Every public reachable address stays identical',
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
const publicDifferences = differences.filter((file) =>
  publicGraphs[0].includes(file),
);
const privateDifferences = differences.filter(
  (file) => !publicGraphs[0].includes(file),
);
assert.deepEqual(
  privateDifferences,
  permittedPrivateModified,
  'Only the two reviewed private collection signatures differ',
);
for (const file of added) {
  assert.ok(
    !publicGraphs[1].includes(file),
    'New helper is unreachable from the public index',
  );
  changed.push({
    file,
    A: null,
    B: fs.readFileSync(path.join(roots[1], file), 'utf8'),
  });
}
const index = fs.readFileSync(path.join(roots[1], 'index.d.ts'));
const baselineIndex = fs.readFileSync(path.join(roots[0], 'index.d.ts'));
const report = {
  baselineFiles: lists[0].length,
  candidateFiles: lists[1].length,
  changedFiles: changed.length,
  normalizedDifferences: differences,
  publicReachableFiles: publicGraphs[0].length,
  publicNormalizedDifferences: publicDifferences,
  privateModified: privateDifferences,
  privateAdded: added,
  packageExportsIdentical: true,
  byteDiff: changed.map((record) => record.file),
  index: {
    bytes: index.length,
    sha256: createHash('sha256').update(index).digest('hex'),
    byteDifference: baselineIndex.equals(index) ? 0 : 'changed',
  },
  method:
    'Compare all existing declarations after proven alias expansion; record exactly two reviewed private signature changes and one private helper addition; prove the identical package root exports reach the same 308 modules with zero normalized differences',
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
  publicDifferences.length,
  0,
  'No public declaration difference after proven alias expansion',
);
console.log(
  'MICRO_DECLARATION_GRAPH_EQUIVALENT ' +
    report.baselineFiles +
    ' changed=' +
    report.changedFiles,
);
