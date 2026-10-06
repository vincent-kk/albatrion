// CLI-only adapter; reuses the committed allocator and 95C-01 paired sentinel.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const pkg = path.resolve(artifacts, '../../../..');
const repo = path.resolve(pkg, '../../..');
const head = '5f50768e561fbb5b3655e4bf6cef9d4b9c227de6';
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'],
  { cwd: repo, encoding: 'utf8' }).trim(), head);

/** Rewrite exactly one adapter anchor; source drift must stop before a measurement. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

let source = fs.readFileSync(path.join(artifacts, 'normalization-memo.mjs'), 'utf8');
source = source.slice(0, source.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
source = source.replaceAll('619798ddc6d6c70f27e1a7058421b94a4a6713b1', head);
source = source.replaceAll("const bundles = path.join(artifacts, 'bundles');",
  "const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';");
source = once(source, "source = once(source, 'allocationFolding: true, includeCollected: true, objects, bytes, blueprintObjects, blueprintBytes, unknown,',\n  'allocationFolding: true, includeCollected: true, objects, bytes, blueprintObjects, blueprintBytes, unknown, nodes: sample.root.runtime.blueprint.nodes.length, execArgv: process.execArgv,');", '');
source = once(source, '\nconst script = fileURLToPath(import.meta.url);', `\nconst script = ${JSON.stringify(script)};`);
source = once(source, "const head = 'e39503af55963026769bc3d49ca4dec79feb8090';", `const head = ${JSON.stringify(head)};`);
source = source.replaceAll("'normalization-memo-'", "'template-keys-'")
  .replaceAll('normalization-memo-${', 'template-keys-${');
source = once(source, 'variant === \'working\' ? content :',
  "variant === 'working' || variant === 'template-keys' ? content :");
source = once(source, 'const effective = row.rows.filter(item => item.owner?.file.includes(\'/blueprint/utils/effectiveSchema/\'));',
  "const effective = row.rows.filter(item => item.owner?.file.endsWith('/getTemplateKey.ts')); ");
source = once(source, 'bundleObjects: objects,\n      bundleObjectsPerNode: objects / row.nodes, bundleBytes: effective.reduce((sum, item) => sum + item.bytes, 0),',
  'bundleObjects: effective.length ? objects : null,\n      bundleObjectsPerNode: effective.length ? objects / row.nodes : null, bundleBytes: effective.length ? effective.reduce((sum, item) => sum + item.bytes, 0) : null, sourceAttribution: effective.length ? "resolved" : "indeterminate-inlined-owner",');
source = source.replaceAll('`allocation-${variant}-nested-d5-f4-r${run}.json`',
  '`template-keys-allocation-${variant}-nested-d5-f4-r${run}.json`');
source = once(source, 'source += \'\\nexport { api, allocation };\\n\';',
  `source = source.replace('save(path.join(artifacts, \u005c\u0060allocation-', 'save(path.join(artifacts, \u005c\u0060template-keys-allocation-');\nsource += '\\nexport { api, allocation };\\n';`);
source = once(source, "sources: ['src/core/blueprint/utils/analyze/buildNodes.ts',\n      'src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts']",
  "sources: ['src/core/blueprint/utils/analyze/buildNodes.ts',\n      'src/core/blueprint/utils/analyze/getTemplateKey.ts']");
source += '\nexport { api, allocation, paired, summarize, child };\n';
const { api, allocation, paired, summarize, child } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const [command, ...args] = process.argv.slice(2);
const started = Date.now();
if (command === '--build') {
  assert(['head', 'control', 'working', 'template-keys'].includes(args[0]));
  const record = await api.buildAsync(args[0]);
  const text = JSON.stringify({ ...record, head });
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(artifacts, `template-keys-build-${args[0]}.json`), text + '\n');
  console.log(JSON.stringify(record));
} else if (command === '--allocations') {
  assert(globalThis.gc, 'Run with --expose-gc');
  assert.equal(args[0], 'template-keys');
  const variant = args[1] ?? 'working';
  assert(['head', 'working'].includes(variant));
  await allocation(variant, 'nested-d5-f4', Number(args[2] ?? '1'));
} else if (command === '--paired-worker') {
  await paired(args[0], args[1], args[2], Number(args[3]), args[4]);
} else if (command === '--pairs') {
  for (let run = 1; run <= 3; run++)
    child(['--expose-gc', script, '--paired-worker', args[0], args[1], args[2], String(run), args[3]]);
} else if (command === '--summarize') {
  summarize();
} else throw new Error('Use --build, --allocations template-keys, --pairs, --paired-worker, --summarize');
assert(Date.now() - started < 480_000);
const record = { args: process.argv.slice(2), execArgv: process.execArgv, head,
  elapsedMs: Date.now() - started, status: 0, signal: null, naturalExit: true,
  driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') };
fs.writeFileSync(path.join(artifacts, 'template-keys-process-' + [command, ...args].join('_') + '.json'),
  JSON.stringify(record, null, 2) + '\n');
