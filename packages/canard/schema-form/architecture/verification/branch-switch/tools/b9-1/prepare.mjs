// Invoked before the quiet window; only immutable built inputs enter the device.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareEngines } from '../../../design-optimization/tools/helpers/prepareEngines.mjs';
import { buildStages } from '../b9-0/buildStages.mjs';
import { digest } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = /^--(baseline|root|candidate-commit)=(.+)$/.exec(arg);
    assert.ok(
      match,
      'Expected --baseline=<archived package> and --root=<external directory>',
    );
    return [
      match[1],
      match[1] === 'candidate-commit' ? match[2] : path.resolve(match[2]),
    ];
  }),
);
assert.ok(options.baseline && options.root && options['candidate-commit']);
assert.equal(
  Number(process.versions.node.split('.')[0]),
  26,
  'Node 26 preparation runtime',
);
const candidate = fileURLToPath(new URL('../../../../../', import.meta.url));
const repository = path.resolve(candidate, '../../..');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repository,
  encoding: 'utf8',
}).trim();
assert.equal(
  options['candidate-commit'],
  commit,
  'Root-confirmed final product commit',
);
assert.equal(
  fs
    .readFileSync(
      path.resolve(options.baseline, '../../../BASELINE_COMMIT'),
      'utf8',
    )
    .trim(),
  '3104b0d9baebfb2a7218242be812eafd769b6753',
);
assert.equal(
  execFileSync(
    'git',
    [
      'status',
      '--porcelain',
      '--',
      path.relative(repository, path.join(candidate, 'src')),
      path.relative(repository, path.join(candidate, 'scripts')),
      path.relative(repository, path.join(candidate, 'rolldown.config.mjs')),
    ],
    { cwd: repository, encoding: 'utf8' },
  ).trim(),
  '',
  'Commit final product, verification and artifact-check inputs before preparation',
);
assert.match(
  options.root.replace(/\.noindex$/, ''),
  /\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+$/,
);
assert.ok(
  options.root.endsWith('.noindex'),
  'Keep every device root outside Spotlight',
);
fs.mkdirSync(options.root, { recursive: false });
fs.symlinkSync(
  path.join(repository, 'node_modules'),
  path.join(options.root, 'node_modules'),
);
const files = {};
const stageBundles = {};
const stageEngines = {};
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
    getStageRoot(options.root, lane) + '/stages',
    path.join(repository, 'node_modules'),
  );
  const stageRoot = getStageRoot(options.root, lane);
  fs.symlinkSync(
    path.join(repository, 'node_modules'),
    path.join(stageRoot, 'node_modules'),
  );
  prepareEngines(
    candidate,
    stageRoot,
    '0.16.1',
    path.join(target, 'index.node.mjs'),
  );
  fs.copyFileSync(
    path.join(stageRoot, 'engines/current.mjs'),
    path.join(stageRoot, 'engines/dist.mjs'),
  );
  stageEngines[lane] = Object.fromEntries(
    ['current.mjs', 'dist.mjs', 'legacy.mjs'].map((name) => [
      name,
      digest(path.join(stageRoot, 'engines', name)),
    ]),
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
  'No public declaration change',
);

fs.writeFileSync(
  path.join(options.root, 'inputs.json'),
  JSON.stringify(
    {
      baselineCommit: '3104b0d9baebfb2a7218242be812eafd769b6753',
      candidateCommit: commit,
      files,
      stageBundles,
      stageEngines,
      tools: Object.fromEntries(
        [
          'architecture/verification/design-optimization/tools/helpers/measurePair.mjs',
          'architecture/verification/branch-switch/tools/b9-0/yieldBeforeSample.mjs',
          'architecture/verification/branch-switch/tools/b9-0/worker.mjs',
          'architecture/verification/branch-switch/tools/b9-0/operation.mjs',
          'architecture/verification/branch-switch/tools/b9-0/buildStages.mjs',
          'architecture/verification/branch-switch/tools/b9-0/instrumentDetails.mjs',
          'architecture/verification/branch-switch/tools/b9-1/window.mjs',
          'architecture/verification/branch-switch/tools/b9-1/helpers/runWindowProcess.mjs',
          'architecture/verification/branch-switch/tools/window/waitForQuietProcess.mjs',
          'architecture/verification/branch-switch/tools/window/getStageRoot.mjs',
          'architecture/verification/branch-switch/tools/b8/quietWorkerPreload.mjs',
          'architecture/verification/branch-switch/tools/b8/helpers/waitForQuietProcess.mjs',
          'architecture/verification/branch-switch/tools/b8/helpers/sampleProcessCpu.mjs',
        ].map((name) => [name, digest(path.join(candidate, name))]),
      ),
      preparedAt: new Date().toISOString(),
      environment: {
        node: process.version,
        bun: execFileSync('bun', ['--version'], {
          encoding: 'utf8',
        }).trim(),
        cpu: os.cpus()[0].model,
        arch: os.arch(),
        release: os.release(),
      },
      stages: [
        'switch-oneOf-80',
        'switch-payload-12',
        'switch-siblings-0',
        'switch-siblings-1000',
      ],
      enteringGroup:
        'inclusive outermost factory, child creation, entry, restore, recursive clone and overlay calls',
    },
    null,
    2,
  ) + '\n',
);
console.log('B9_1_PREPARED ' + options.root);
