// CLI preparation builds scratch bundles before smoke and the single formal window.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildStages as buildPrevious } from '../b6/buildStages.mjs';
import { buildStages } from './buildStages.mjs';
import { digest, json, read } from './files.mjs';
import { rows } from './rows.mjs';

const root = path.resolve(process.argv[2]);
const base = process.argv[3];
assert.equal(Number(process.versions.node.split('.')[0]), 26);
const pkg = fileURLToPath(new URL('../../../../../', import.meta.url));
const repo = path.resolve(pkg, '../../..');
const git = (...args) =>
  execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(git('diff', base, '--', 'packages/canard/schema-form/src'), '');
assert.equal(
  git('status', '--porcelain', '--', 'packages/canard/schema-form/src'),
  '',
);
assert.ok(!fs.existsSync(root), 'New external run directory');
fs.mkdirSync(root, { recursive: true });
fs.symlinkSync(
  path.join(repo, 'node_modules'),
  path.join(root, 'node_modules'),
);
fs.mkdirSync(path.join(root, 'dist'));
const files = {},
  baseDist = {};
for (const name of ['index.mjs', 'index.node.mjs', 'index.cjs', 'index.d.ts']) {
  fs.copyFileSync(path.join(pkg, 'dist', name), path.join(root, 'dist', name));
  files['dist/' + name] = digest(path.join(root, 'dist', name));
  baseDist[name] = files['dist/' + name];
}
// This first build ran at the rebased base HEAD; verify a second designated build against it later.
json(path.join(root, 'base-dist-hashes.json'), baseDist);
const scratch = await buildStages(
  pkg,
  path.join(root, 'stages'),
  path.join(repo, 'node_modules'),
);
const previous = await buildPrevious(
  pkg,
  path.join(root, 'b6-reference'),
  path.join(repo, 'node_modules'),
);
assert.deepEqual(
  digest(path.join(scratch, 'wrapped.mjs')),
  digest(path.join(previous, 'wrapped.mjs')),
  'B6 comparative bundle byte identity',
);
const manifest = read(path.join(scratch, 'instrumentation.json'));
const old = read(path.join(previous, 'instrumentation.json'));
const byName = (a, b) => a.name.localeCompare(b.name);
assert.deepEqual(manifest.stages.toSorted(byName), old.stages.toSorted(byName));
for (const name of [
  'wrapped',
  'supplemental',
  'gap',
  'diagnostic',
  'unwrapped',
])
  files['stages/scratch/' + name + '.mjs'] = digest(
    path.join(scratch, name + '.mjs'),
  );
files['stages/scratch/instrumentation.json'] = digest(
  path.join(scratch, 'instrumentation.json'),
);
fs.mkdirSync(path.join(root, 'engines'));
const exportInternal = (source, target, names) => {
  const text = fs.readFileSync(source, 'utf8');
  for (const name of names)
    assert.match(
      text,
      new RegExp(
        '^(?:const|var|let|function|class) ' +
          name.split(' as ')[0] +
          '(?:[ (=;])',
        'm',
      ),
    );
  const missing = names.filter(
    (name) =>
      name.includes(' as ') ||
      !new RegExp('\\b' + name + '\\s*(?:,|\\s|})').test(
        text.slice(text.lastIndexOf('export {')),
      ),
  );
  fs.writeFileSync(target, text + '\nexport { ' + missing.join(', ') + ' };\n');
};
exportInternal(
  path.join(root, 'dist/index.node.mjs'),
  path.join(root, 'engines/dist.mjs'),
  ['buildFieldNodeTree', 'mountFieldNode', 'registerPlugin'],
);
const require = createRequire(path.join(pkg, 'package.json'));
const legacyFile = path.join(
  path.dirname(require.resolve('@canard/schema-form_0.16.1')),
  'index.mjs',
);
const legacyPkg = read(
  path.resolve(path.dirname(legacyFile), '../package.json'),
);
assert.equal(legacyPkg.version, '0.16.1');
exportInternal(legacyFile, path.join(root, 'engines/legacy.mjs'), [
  'nodeFromJSONSchema as legacyNodeFromJSONSchema',
]);
// The alias has a distinct exported name, while the declaration check targets its source name.
files['engines/dist.mjs'] = digest(path.join(root, 'engines/dist.mjs'));
files['engines/legacy.mjs'] = digest(path.join(root, 'engines/legacy.mjs'));
const plugin = require.resolve('@canard/schema-form-ajv8-plugin');
json(path.join(root, 'inputs.json'), {
  base: git('rev-parse', base),
  head: git('rev-parse', 'HEAD'),
  node: process.version,
  config: { runs: 10, warmups: 20, samples: 100, quality: 'legacy' },
  rows,
  files,
  legacy: { version: legacyPkg.version, sha256: digest(legacyFile).sha256 },
  plugin: { entry: path.basename(plugin), ...digest(plugin) },
  comparativeBundleIdenticalToB6: true,
  environment: { cpu: os.cpus()[0].model, arch: os.arch(), os: os.release() },
  preparedAt: new Date().toISOString(),
});
console.log('B9_0_PREPARED');
