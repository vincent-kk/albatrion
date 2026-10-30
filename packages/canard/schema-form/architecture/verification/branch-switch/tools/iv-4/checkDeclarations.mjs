// Compare the designated A/B declaration artifacts; private differences remain in the report.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { collectReachableDeclarations } from '../micro-hygiene/helpers/collectReachableDeclarations.mjs';

const [baseline, candidate, output] = process.argv
  .slice(2)
  .map((value) => path.resolve(value));
const walk = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : entry.name.endsWith('.d.ts')
          ? [path.join(directory, entry.name)]
          : [],
    );
const roots = [baseline, candidate].map((directory) =>
  path.join(directory, 'dist'),
);
const lists = roots.map((directory) =>
  walk(directory)
    .map((file) => path.relative(directory, file))
    .sort(),
);
const manifests = [baseline, candidate].map((directory) =>
  JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')),
);
assert.deepEqual(manifests[0].exports, manifests[1].exports);
assert.equal(manifests[0].types, manifests[1].types);
const publicGraphs = roots.map(collectReachableDeclarations);
assert.deepEqual(publicGraphs[0], publicGraphs[1]);
const changed = [];
for (const file of [...lists[0], ...lists[1]].filter(
  (file, index, all) => all.indexOf(file) === index,
)) {
  const [A, B] = roots.map((directory) =>
    fs.existsSync(path.join(directory, file))
      ? fs.readFileSync(path.join(directory, file), 'utf8')
      : null,
  );
  if (A !== B)
    changed.push({ file, A, B, public: publicGraphs[0].includes(file) });
}
const index = roots.map((directory) =>
  fs.readFileSync(path.join(directory, 'index.d.ts')),
);
assert.ok(
  index[0].equals(index[1]),
  'Public index declaration bytes must stay unchanged',
);
assert.ok(
  changed.every((row) => !row.public),
  'No reachable public declaration changes',
);
const report = {
  baselineFiles: lists[0].length,
  candidateFiles: lists[1].length,
  publicReachableFiles: publicGraphs[0].length,
  publicDifferences: 0,
  privateDifferences: changed.map((row) => row.file),
  indexByteDifference: 0,
  indexSha256: createHash('sha256').update(index[0]).digest('hex'),
  packageExportsIdentical: true,
  node: process.version,
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
console.log('IV4_DECLARATIONS_OK ' + JSON.stringify(report));
