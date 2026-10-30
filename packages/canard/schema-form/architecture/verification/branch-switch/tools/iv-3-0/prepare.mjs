// CLI prepares one immutable diagnostic root; no sampling or product instrumentation is performed.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hashInputs } from './helpers/hashInputs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(here, '../../../../../../../..');
const packageDir = path.join(repoDir, 'packages/canard/schema-form');
const requestedRoot = path.resolve(process.argv[2]);
const root = path.join(
  fs.realpathSync(path.dirname(requestedRoot)),
  path.basename(requestedRoot),
);
assert.ok(root.endsWith('.noindex') && !root.startsWith(repoDir + '/'));
assert.ok(!fs.existsSync(root), 'Preserve earlier diagnostic roots');
const productBase = '510962d634c94dc56be808b693d76aa86e4af11a';
const productPaths = [
  'packages/canard/schema-form/src',
  'packages/canard/schema-form/package.json',
  'packages/canard/schema-form/rolldown.config.mjs',
];
execFileSync(
  'git',
  ['diff', '--quiet', productBase, 'HEAD', '--', ...productPaths],
  { cwd: repoDir },
);
execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...productPaths], {
  cwd: repoDir,
});
const hashes = hashInputs(repoDir);
const sourceMtimeMs = Math.max(
  ...Object.keys(hashes)
    .filter((file) => file.startsWith('packages/canard/schema-form/src/'))
    .map((file) => fs.statSync(path.join(repoDir, file)).mtimeMs),
);
assert.ok(
  fs.statSync(path.join(packageDir, 'dist/index.node.mjs')).mtimeMs >=
    sourceMtimeMs,
  'Product build must be newer than all source files',
);
const bundle = fs.readFileSync(
  path.join(packageDir, 'dist/index.node.mjs'),
  'utf8',
);
const mapping = JSON.parse(
  fs.readFileSync(path.join(here, 'branches.json'), 'utf8'),
);
const bundleLines = bundle.split('\n');
for (const rule of mapping.frameLocations) {
  assert.ok(
    rule.evidence && bundleLines[rule.line - 1].includes(rule.anchor),
    'Frame address evidence: ' + rule.name,
  );
  assert.equal(
    bundleLines
      .slice(0, rule.line)
      .filter((line) => line.startsWith('//#region '))
      .at(-1),
    '//#region ' + rule.source,
  );
}
for (const name of Object.values(mapping.groups)
  .flat()
  .filter((name) => !name.startsWith('(')))
  assert.match(
    bundle,
    new RegExp('(?:const|var|let|function|class) ' + name + '\\b'),
    'Mapped function exists: ' + name,
  );
const names = ['buildFieldNodeTree', 'mountFieldNode'];
for (const name of [
  ...names,
  'FieldNode',
  'cloneSlotSubtree',
  'selectChildren',
])
  assert.match(
    bundle,
    new RegExp('(?:const|var|function|class) ' + name + '[ (=]'),
    'Unmangled product name: ' + name,
  );
fs.mkdirSync(path.join(root, 'raw.noindex'), { recursive: true });
fs.symlinkSync(
  path.join(repoDir, 'node_modules'),
  path.join(root, 'node_modules'),
);
const engine = bundle + '\nexport { ' + names.join(', ') + ' };\n';
fs.writeFileSync(path.join(root, 'engine.mjs'), engine);
const inputs = {
  productBase,
  rootNormalizationChanged: root !== requestedRoot,
  sourceMatchesBase: true,
  buildNewerThanSources: true,
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoDir,
    encoding: 'utf8',
  }).trim(),
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  cpu: os.cpus()[0].model,
  osRelease: os.release(),
  nodeSha256: createHash('sha256')
    .update(fs.readFileSync(process.execPath))
    .digest('hex'),
  engineSha256: createHash('sha256').update(engine).digest('hex'),
  build:
    'Designated yarn workspace build; existing unminified index.node.mjs plus private fixture exports; no instrumentation',
  hashes,
};
fs.writeFileSync(
  path.join(root, 'inputs.json'),
  JSON.stringify(inputs, null, 2) + '\n',
);
console.log('IV_3_0_PREPARED');
