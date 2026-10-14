// CLI preparation only; production bundles are confined to the authorized scratch directory.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { directory, pkg, repo, scratch, HEAD, hash, git, emit, req } from './runtime.mjs';

const started = new Date().toISOString();
const replace = (source, before, after) => {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
};
const paths = childProcess.execFileSync('rg', ['--files', path.join(pkg, 'src'), '--hidden'],
  { encoding: 'utf8' }).trim().split('\n').sort();
const sources = Object.fromEntries(paths.map(file => [path.relative(repo, file), hash(fs.readFileSync(file))]));
const status = git(['status', '--short']);
const changed = status.split('\n').map(line => line.slice(3)).filter(file => file.startsWith('packages/canard/schema-form/src/') && fs.existsSync(path.join(repo, file)) && fs.statSync(path.join(repo, file)).isFile());
const baseline = { HEAD, started, sourceFiles: paths.length, changedSources: Object.fromEntries(changed.map(file => [file, sources[file]])), sourceTreeSha256: hash(JSON.stringify(sources)),
  srcDiffSha256: hash(git(['diff', '--', 'packages/canard/schema-form/src'])), status };

let branch = fs.readFileSync(path.join(directory, '../tools/prepare-branch1-bundles.mjs'), 'utf8');
branch = replace(branch, "const head = '831805d27d8313762afd7ca1f1feca2098c6aa25';", `const head = '${HEAD}';`);
branch = replace(branch, "const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');",
  `const packageRoot = ${JSON.stringify(pkg)};`);
branch = replace(branch, "return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };",
  "return { contents: args.path.endsWith('/fixtures/equivalent/branches.ts') ? contents.replace('[5, 10, 20].map', '[5, 10, 20, 40].map') : contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };");
branch = replace(branch, 'console.log(JSON.stringify(await prepareBranch1Bundles(packageRoot, scratch), null, 2));',
  'export const prepared = await prepareBranch1Bundles(packageRoot, scratch);');
const branchApi = await import('data:text/javascript;base64,' + Buffer.from(branch).toString('base64'));
console.log('현재 HEAD와 작업 번들 준비가 끝났습니다.');

const originalFile = path.join(pkg, 'bench/branchless-phase-diagnosis.mjs');
let source = fs.readFileSync(originalFile, 'utf8');
source = replace(source, "import { writeMeasurement } from './measurement-output.mjs';",
  `import { writeMeasurement } from ${JSON.stringify(pathToFileURL(path.join(pkg, 'bench/measurement-output.mjs')).href)};`);
source = replace(source, "const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');", `const pkg = ${JSON.stringify(pkg)};`);
source = replace(source, "const engines = { old: await bundle('old'), new: await bundle('new') };", "const engines = { old: await bundle('old') };");
source = replace(source, 'engines.new.equivalentFixtures.filter', 'engines.old.equivalentFixtures.filter');
source = replace(source, "'src/__legacy__/core/nodeFromJSONSchema.ts'", "'release-core'");
source = replace(source, "return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };",
  "return { path: found, namespace: 'release-binding' };");
source = replace(source, "builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));",
  "builder.onResolve({ filter: /\\/release-core$/ }, () => oldResolve('core/nodeFromJSONSchema'));\n      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));");
source = replace(source, 'const module = { exports: {} };',
  `const saved = "require = require('node:module').createRequire(" + ${JSON.stringify(JSON.stringify(path.join(pkg, 'package.json')))} + ");\\n" + result.outputFiles[0].text;
   fs.writeFileSync(${JSON.stringify(path.join(scratch, 'split-old.cjs'))}, saved);
   const module = { exports: {} };`);
source = replace(source, 'export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };',
  'export { engines, virtualSources };');
process.argv.push('--probe-import', '--plain', '--production');
const services = [], nativeSpawn = childProcess.spawn;
delete req.cache[req.resolve('esbuild')];
childProcess.spawn = function (...args) {
  const child = Reflect.apply(nativeSpawn, childProcess, args);
  if (String(args[0]).includes('esbuild')) services.push(child);
  return child;
};
let old;
try { old = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')); }
finally {
  childProcess.spawn = nativeSpawn;
  for (const service of services) {
    service.ref();
    const exit = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode, null]);
    service.stdin.end();
    const [code, signal] = await exit;
    assert.equal(code, 0); assert.equal(signal, null);
  }
}
const oldText = fs.readFileSync(path.join(scratch, 'split-old.cjs'));
assert(oldText.byteLength <= 5_000_000);
assert(!/__phaseEnter|__phaseExit/.test(oldText.toString()));
emit('baseline.json', baseline);
emit('bundles.json', { HEAD, started, ended: new Date().toISOString(), branchToolAdapterSha256: hash(branch),
  oldToolAdapterSha256: hash(source), bundles: [...branchApi.prepared,
    { file: path.join(scratch, 'split-old.cjs'), revision: '@canard/schema-form@0.16.0',
      sha256: hash(oldText), bytes: oldText.byteLength, instrumented: false, naturalBuildServiceExits: services.length }],
  releaseSources: Object.fromEntries([...old.virtualSources].map(([file, text]) => [file, hash(text)])),
  branchFixtureExtension: '[5,10,20] to [5,10,20,40]; BF authored transitions unchanged',
  sourceTreeSha256: baseline.sourceTreeSha256 });
console.log('공개판 코어와 세션 입력 해시 준비가 끝났습니다.');
