// Invoked before the quiet window; only immutable built inputs enter the device.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildStages } from './buildStages.mjs';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = /^--(baseline|root)=(.+)$/.exec(arg);
    assert.ok(
      match,
      'Expected --baseline=<archived package> and --root=<external directory>',
    );
    return [match[1], path.resolve(match[2])];
  }),
);
assert.ok(options.baseline && options.root);
const candidate = fileURLToPath(new URL('../../../../../', import.meta.url));
const repository = path.resolve(candidate, '../../..');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repository,
  encoding: 'utf8',
}).trim();
assert.equal(
  execFileSync(
    'git',
    [
      'status',
      '--porcelain',
      '--',
      path.relative(repository, path.join(candidate, 'src')),
      path.relative(repository, path.join(candidate, 'scripts')),
      path.relative(repository, path.join(candidate, 'rolldown.config.ts')),
    ],
    { cwd: repository, encoding: 'utf8' },
  ).trim(),
  '',
  'Commit final product, verification and artifact-check inputs before preparation',
);
assert.match(
  options.root,
  /\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+$/,
);
fs.mkdirSync(options.root, { recursive: false });
fs.symlinkSync(
  path.join(repository, 'node_modules'),
  path.join(options.root, 'node_modules'),
);
const files = {};
const stageBundles = {};
for (const [lane, source] of [
  ['A', options.baseline],
  ['B', candidate],
]) {
  const target = path.join(options.root, 'bundles', lane);
  fs.mkdirSync(target, { recursive: true });
  files[lane] = {};
  for (const name of ['index.node.mjs', 'index.mjs', 'index.d.ts']) {
    const bytes = fs.readFileSync(path.join(source, 'dist', name));
    fs.writeFileSync(path.join(target, name), bytes);
    files[lane][name] = {
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }
  const scratch = await buildStages(
    source,
    options.root + '-stage-' + lane.toLowerCase() + '/stages',
    path.join(repository, 'node_modules'),
  );
  stageBundles[lane] = {};
  for (const name of [
    'wrapped.mjs',
    'unwrapped.mjs',
    'supplemental.mjs',
    'instrumentation.json',
  ]) {
    const bytes = fs.readFileSync(path.join(scratch, name));
    stageBundles[lane][name] = {
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }
}
assert.equal(
  files.A['index.d.ts'].sha256,
  files.B['index.d.ts'].sha256,
  'Public declarations remain unchanged',
);
fs.writeFileSync(
  path.join(options.root, 'inputs.json'),
  JSON.stringify(
    {
      candidateCommit: commit,
      files,
      stageBundles,
      preparedAt: new Date().toISOString(),
      stages: ['switch-oneOf-80', 'switch-payload-12', 'switch-siblings-0'],
      enteringGroup:
        'inclusive outermost factory, child creation, entry, restore, recursive clone and overlay calls',
    },
    null,
    2,
  ) + '\n',
);
console.log('B4_PREPARED ' + options.root);
