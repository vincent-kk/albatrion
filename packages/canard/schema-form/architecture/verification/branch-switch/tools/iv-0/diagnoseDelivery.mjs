// The existing public observer remains canonical; only its scratch CLI receives labels.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2]);
const original = fileURLToPath(
  new URL('../b4-2/delivery.mjs', import.meta.url),
);
const generated = path.join(root, 'diagnostics/delivery.mjs');
let source = fs
  .readFileSync(original, 'utf8')
  .replace(/from '([^']+)'/g, (match, relative) =>
    relative.startsWith('.')
      ? 'from ' +
        JSON.stringify(
          pathToFileURL(path.resolve(path.dirname(original), relative)).href,
        )
      : match,
  );
const prefix = `
import {installDisabledHooks} from ${JSON.stringify(new URL('./diagnostics/installDisabledHooks.mjs', import.meta.url).href)};
import {createDiagnosticRecorder} from ${JSON.stringify(new URL('./diagnostics/createDiagnosticRecorder.mjs', import.meta.url).href)};
installDisabledHooks(globalThis);
const __ivEngine=await import(${JSON.stringify(pathToFileURL(path.join(root, 'diagnostics/diagnostics.mjs')).href)});
const __ivRecorder=createDiagnosticRecorder(__ivEngine);
globalThis.__iv=__ivRecorder;
`;
assert.equal(source.split('  const [a, b] = await Promise.all(').length, 2);
source = source
  .replace(
    '  const [a, b] = await Promise.all(',
    '__ivRecorder.enabled=false; __ivRecorder.label=spec.id;\n  const [a, b] = await Promise.all(',
  )
  .replace(
    "  compare('before');",
    "  compare('before'); __ivRecorder.enabled=true;",
  )
  .replace(
    'const inactiveValueScenes =',
    `__ivRecorder.enabled=false;fs.writeFileSync(${JSON.stringify(path.join(root, 'delivery-diagnostics.json'))},JSON.stringify({timed:false,rows:__ivRecorder.rows})+'\\n');\nconst inactiveValueScenes =`,
  );
fs.writeFileSync(generated, prefix + source);
const result = execFileSync(
  process.execPath,
  [
    generated,
    '--baseline=' + path.join(root, 'bundles/B/index.node.mjs'),
    '--candidate=' + path.join(root, 'diagnostics/diagnostics.mjs'),
    '--output=' + path.join(root, 'delivery'),
  ],
  {
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production' },
    maxBuffer: 16 * 1024 * 1024,
  },
);
console.log(result.trim());
const report = JSON.parse(
  fs.readFileSync(path.join(root, 'delivery/summary.json'), 'utf8'),
);
assert.equal(report.rows.length, 79);
assert.equal(report.differences, 0);
const diagnostics = JSON.parse(
  fs.readFileSync(path.join(root, 'delivery-diagnostics.json'), 'utf8'),
);
assert.ok(
  diagnostics.rows.every(
    (row) =>
      row.deliveryAllocations?.[
        'src/core/engine/write/utils/chain/exitFieldNodeChain.ts:Set'
      ] >= 1,
  ),
  'Every corpus write includes chain-exit allocations',
);
console.log('IV_0_DELIVERY_DIAGNOSTICS_OK scenes=79 differences=0');
