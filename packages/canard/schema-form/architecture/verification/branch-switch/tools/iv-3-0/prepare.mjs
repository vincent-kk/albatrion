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
const root = path.resolve(process.argv[2]);
assert.ok(root.endsWith('.noindex') && !root.startsWith(repoDir + '/'));
assert.ok(!fs.existsSync(root), 'Preserve earlier diagnostic roots');
const bundle = fs.readFileSync(
  path.join(packageDir, 'dist/index.node.mjs'),
  'utf8',
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
  productBase: '510962d634c94dc56be808b693d76aa86e4af11a',
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
  hashes: hashInputs(repoDir),
};
fs.writeFileSync(
  path.join(root, 'inputs.json'),
  JSON.stringify(inputs, null, 2) + '\n',
);
console.log('IV_3_0_PREPARED');
