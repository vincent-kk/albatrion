// Invoked before smoke; the CLI freezes existing builds without modifying product inputs.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareEngines } from '../../../design-optimization/tools/helpers/prepareEngines.mjs';
import { buildBundle } from '../../../design-optimization/tools/profile/branch-switch/buildBundle.mjs';
import { buildStages } from '../b9-0/buildStages.mjs';
import { digest, json, read } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { buildDiagnostics } from './buildDiagnostics.mjs';

assert.equal(process.versions.node.split('.')[0], '26');
const [rootArgument, startArgument] = process.argv.slice(2);
assert.ok(
  rootArgument && startArgument,
  'prepare <new .noindex root> <stage-start package>',
);
const root = path.resolve(rootArgument),
  start = path.resolve(startArgument);
assert.ok(root.endsWith('.noindex'));
assert.ok(!fs.existsSync(root), 'Never overwrite preparation or evidence');
const packageDir = fileURLToPath(new URL('../../../../../', import.meta.url));
const repository = path.resolve(packageDir, '../../..');
const prefix = path.relative(repository, packageDir);
const startCommit = '0eb03ff3bb54bf06af95271d157aefece1b9bf32';
const stageHead = execFileSync('git', ['rev-parse', 'b026bd04f'], {
  cwd: repository,
  encoding: 'utf8',
}).trim();
assert.equal(
  execFileSync(
    'git',
    [
      'diff',
      stageHead,
      '--',
      prefix + '/src',
      prefix + '/package.json',
      prefix + '/rolldown.config.mjs',
    ],
    { cwd: repository, encoding: 'utf8' },
  ),
  '',
);
const sourceEntries = execFileSync(
  'git',
  ['ls-tree', '-rz', startCommit, '--', prefix + '/src'],
  { cwd: repository, encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
const archivedFiles = sourceEntries.map((entry) =>
  path.join(start, entry.split('\t')[1].slice(prefix.length + 1)),
);
const archivedBlobs = execFileSync('git', ['hash-object', '--stdin-paths'], {
  cwd: repository,
  input: archivedFiles.join('\n') + '\n',
  encoding: 'utf8',
})
  .trim()
  .split('\n');
assert.deepEqual(
  archivedBlobs,
  sourceEntries.map((entry) => entry.split('\t')[0].split(' ')[2]),
  'Archived stage-start source equals its Git tree',
);
const mergedHashes = read(
  path.join(
    packageDir,
    'architecture/verification/branch-switch/raw/b9-1/merge-stage/window/inputs.json',
  ),
).files.B;
for (const [name, hash] of Object.entries(mergedHashes))
  assert.deepEqual(
    digest(path.join(packageDir, 'dist', name)),
    hash,
    'Current dist equals stage head: ' + name,
  );
const startingHashes = read(
  path.join(
    packageDir,
    'architecture/verification/branch-switch/raw/b5/inputs.json',
  ),
);
fs.mkdirSync(root);
fs.symlinkSync(
  path.join(repository, 'node_modules'),
  path.join(root, 'node_modules'),
);
const files = {};
for (const [lane, source] of [
  ['A', start],
  ['B', packageDir],
]) {
  const target = path.join(root, 'bundles', lane);
  fs.mkdirSync(target, { recursive: true });
  for (const name of [
    'index.node.mjs',
    'index.mjs',
    'index.cjs',
    'index.d.ts',
  ]) {
    fs.copyFileSync(path.join(source, 'dist', name), path.join(target, name));
    if (lane === 'A')
      assert.deepEqual(
        digest(path.join(target, name)),
        startingHashes.files.S[name],
        'Stage start equals B5 S: ' + name,
      );
    files['bundles/' + lane + '/' + name] = digest(path.join(target, name));
  }
  const stageRoot = getStageRoot(root, lane);
  if (lane === 'A') await buildBundle(source, path.join(stageRoot, 'stages'));
  else
    await buildStages(
      source,
      path.join(stageRoot, 'stages'),
      path.join(repository, 'node_modules'),
    );
  if (!fs.existsSync(path.join(stageRoot, 'node_modules')))
    fs.symlinkSync(
      path.join(repository, 'node_modules'),
      path.join(stageRoot, 'node_modules'),
    );
  prepareEngines(
    packageDir,
    stageRoot,
    '0.16.1',
    path.join(target, 'index.node.mjs'),
  );
  fs.copyFileSync(
    path.join(stageRoot, 'engines/current.mjs'),
    path.join(stageRoot, 'engines/dist.mjs'),
  );
  files[lane + '/engines/current.mjs'] = digest(
    path.join(stageRoot, 'engines/current.mjs'),
  );
  for (const name of ['unwrapped.mjs', 'wrapped.mjs', 'instrumentation.json'])
    files[lane + '/stages/' + name] = digest(
      path.join(stageRoot, 'stages/scratch', name),
    );
}
await buildDiagnostics(packageDir, path.join(root, 'diagnostics'));
for (const name of ['plain', 'details', 'diagnostics'])
  files['diagnostics/' + name + '.mjs'] = digest(
    path.join(root, 'diagnostics', name + '.mjs'),
  );
const toolFiles = execFileSync(
  'rg',
  [
    '--files',
    'architecture/verification/branch-switch/tools',
    'architecture/verification/design-optimization/tools',
  ],
  { cwd: packageDir, encoding: 'utf8' },
)
  .trim()
  .split('\n')
  .filter((file) => file.endsWith('.mjs'));
json(path.join(root, 'inputs.json'), {
  stageHead,
  startCommit,
  preparedAt: new Date().toISOString(),
  node: process.version,
  config: { runs: 10, warmups: 20, samples: 100, quality: 'legacy' },
  files,
  tools: Object.fromEntries(
    toolFiles.map((file) => [file, digest(path.join(packageDir, file))]),
  ),
  environment: {
    node: process.version,
    bun: execFileSync('bun', ['--version'], { encoding: 'utf8' }).trim(),
    cpu: os.cpus()[0].model,
    arch: os.arch(),
    release: os.release(),
  },
  sourceProof: {
    stageStartFiles: sourceEntries.length,
    stageStartAllBlobsMatch: true,
    productDiff: false,
  },
  startingReference:
    startingHashes.files ?? startingHashes.bundles ?? startingHashes,
});
console.log('IV_0_PREPARED ' + root);
