// CLI freezes one lane from a designated build; never overwrites a prepared input.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { hashInputs } from '../iv-3-0/helpers/hashInputs.mjs';

const [requested, lane] = process.argv.slice(2);
assert.ok(requested && (lane === 'A' || lane === 'B'));
assert.equal(process.versions.node.split('.')[0], '26');
const repo = fs.realpathSync(
  fileURLToPath(new URL('../../../../../../../../', import.meta.url)),
);
const root = path.join(
  fs.realpathSync(path.dirname(path.resolve(requested))),
  path.basename(requested),
);
assert.ok(root.endsWith('.noindex') && !root.startsWith(repo + '/'));
fs.mkdirSync(root, { recursive: true });
if (!fs.existsSync(path.join(root, 'node_modules')))
  fs.symlinkSync(
    path.join(repo, 'node_modules'),
    path.join(root, 'node_modules'),
  );
const directory = path.join(root, lane);
fs.mkdirSync(directory);
fs.mkdirSync(path.join(root, 'raw.noindex'), { recursive: true });
execFileSync(
  'git',
  ['diff', '--quiet', 'HEAD', '--', 'packages/canard/schema-form/src'],
  { cwd: repo },
);
const hashes = hashInputs(repo);
const newest = Math.max(
  ...Object.keys(hashes)
    .filter((file) => file.startsWith('packages/canard/schema-form/src/'))
    .map((file) => fs.statSync(path.join(repo, file)).mtimeMs),
);
const bundle = path.join(
  repo,
  'packages/canard/schema-form/dist/index.node.mjs',
);
assert.ok(
  fs.statSync(bundle).mtimeMs >= newest,
  'Designated build must follow product edits',
);
const bytes = fs.readFileSync(bundle, 'utf8');
for (const name of ['buildFieldNodeTree', 'mountFieldNode'])
  assert.match(bytes, new RegExp('(?:const|var|function) ' + name + '[ (=]'));
fs.writeFileSync(
  path.join(directory, 'engine.mjs'),
  bytes + '\nexport { buildFieldNodeTree, mountFieldNode };\n',
);
json(path.join(directory, 'inputs.json'), {
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repo,
    encoding: 'utf8',
  }).trim(),
  node: process.version,
  lane,
  engine: digest(path.join(directory, 'engine.mjs')),
  nodeBinary: digest(process.execPath),
  hashes,
});
console.log('IV_4_PREPARED ' + lane);
