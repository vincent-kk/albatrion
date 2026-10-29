// Reuse B9-1's immutable A/B preparation and extend its manifest before any smoke.
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { buildDiagnostics } from '../iv-0/buildDiagnostics.mjs';
import { rows } from './rows.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const root = process.argv
  .slice(2)
  .find((arg) => arg.startsWith('--root='))
  ?.slice(7);
assert.ok(root);
execFileSync(
  process.execPath,
  [path.join(here, '../b9-1/prepare.mjs'), ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
inputs.stages = rows.map((row) => row.id);
inputs.tools[
  'architecture/verification/branch-switch/tools/window/eventWeights.json'
] = digest(path.join(here, '../window/eventWeights.json'));
for (const file of fs
  .readdirSync(here)
  .filter((file) => file.endsWith('.mjs'))) {
  const name = 'architecture/verification/branch-switch/tools/iv-1/' + file;
  inputs.tools[name] = digest(path.join(here, file));
}
inputs.diagnostics = await buildDiagnostics(
  packageDir,
  path.join(root, 'diagnostics'),
);
await build({
  stdin: {
    contents: `export {buildSettlementScopes} from ${JSON.stringify(path.join(packageDir, 'src/core/engine/blueprint/utils/settlement/buildSettlementScopes.ts'))};`,
    resolveDir: packageDir,
    loader: 'ts',
  },
  bundle: true,
  packages: 'external',
  format: 'esm',
  platform: 'node',
  target: 'node26',
  tsconfig: path.join(packageDir, 'tsconfig.json'),
  outfile: path.join(root, 'diagnostics/scope-builder.mjs'),
});
inputs.scopeBuilder = digest(path.join(root, 'diagnostics/scope-builder.mjs'));
json(path.join(root, 'inputs.json'), inputs);
console.log('IV_1_PREPARED');
