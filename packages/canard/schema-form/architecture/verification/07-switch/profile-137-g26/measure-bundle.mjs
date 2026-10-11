// Loaded by Node from stage-07; package build options write only to the authorized scratchpad.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
assert.equal(process.cwd(), repo);
const pkg = path.join(repo, 'packages/canard/schema-form');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const require = createRequire(path.join(pkg, 'package.json'));
const { getBundleBuildOptions } = await import(pathToFileURL(path.join(repo,
  'packages/aileron/script/build/rolldown.bundle.mjs')).href);
const { bundleBuildOptions } = getBundleBuildOptions(pathToFileURL(path.join(pkg, 'rolldown.config.mjs')).href);
const { rolldown } = await import(pathToFileURL(require.resolve('rolldown')).href);
fs.mkdirSync(scratch, { recursive: true });
const results = {};
let esmCode;
for (const [format, extension] of [['esm', 'mjs'], ['cjs', 'cjs']]) {
  const file = path.join(scratch, `index.${extension}`);
  const options = await bundleBuildOptions({ entry: './src/index.ts', format,
    outFile: file, sourcemap: false, minify: false });
  const build = await rolldown(options);
  let output;
  try { ({ output } = await build.write(options.output)); }
  finally { await build.close(); }
  assert.equal(output.length, 1);
  const chunk = output[0];
  assert.equal(chunk.type, 'chunk');
  const rawBytes = Buffer.byteLength(chunk.code);
  assert(rawBytes <= 5_000_000);
  const modules = Object.keys(chunk.modules);
  const legacyModules = modules.filter(id => id.includes('__legacy__'));
  assert.equal(legacyModules.length, 0);
  results[format] = { rawBytes, moduleCount: modules.length, legacyModules,
    sha256: createHash('sha256').update(chunk.code).digest('hex') };
  if (format === 'esm') esmCode = chunk.code;
  console.log(`${format} 빌드: ${rawBytes} B, legacy ${legacyModules.length}개`);
}

const childProcess = require('node:child_process');
const originalSpawn = childProcess.spawn;
let service, closed;
childProcess.spawn = (...args) => {
  const child = originalSpawn(...args);
  if (path.basename(args[0]) === 'esbuild') {
    assert(!service);
    service = child;
    closed = new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
  }
  return child;
};
const { build } = require('esbuild');
let minified;
try {
  const output = await build({ entryPoints: [path.join(scratch, 'index.mjs')],
    outfile: path.join(scratch, 'index.min.mjs'), write: false, sourcemap: false,
    bundle: true, minify: true, format: 'esm', packages: 'external' });
  assert.equal(output.outputFiles.length, 1);
  minified = output.outputFiles[0].contents;
  assert(minified.length <= 5_000_000);
} finally {
  assert(service);
  service.ref();
  service.stdin.end();
  results.esbuildExit = await closed;
  assert.deepEqual(results.esbuildExit, { code: 0, signal: null });
  childProcess.spawn = originalSpawn;
}
fs.writeFileSync(path.join(scratch, 'index.min.mjs'), minified);
for (const [key, name, baseline] of [['minifyGzip', 'index.min.mjs', 37_023],
  ['plainGzip', 'index.mjs', 51_632]]) {
  const compressed = spawnSync('gzip', ['-9', '-c', path.join(scratch, name)], { maxBuffer: 5_000_000 });
  assert.equal(compressed.status, 0);
  assert.equal(compressed.signal, null);
  results[key] = { bytes: compressed.stdout.length, baseline,
    ratio: compressed.stdout.length / baseline, difference: compressed.stdout.length - baseline,
    exit: compressed.status, signal: compressed.signal };
}
results.minifiedRawBytes = minified.length;
const modules = [...esmCode.matchAll(/^\/\/#region ([^\r\n]+)\r?\n([\s\S]*?)^\/\/#endregion[^\r\n]*/gm)]
  .map(match => ({ source: match[1], bytes: Buffer.byteLength(match[0]) }));
assert(modules.length > 0, 'Package-generated region markers must support byte attribution');
const attributed = modules.reduce((sum, item) => sum + item.bytes, 0);
results.breakdown = { basis: 'unminified ESM emitted region bytes',
  modules: modules.toSorted((left, right) => right.bytes - left.bytes),
  wrapperAndSeparatorsBytes: results.esm.rawBytes - attributed };
results.toolVersions = { rolldown: require('rolldown/package.json').version,
  esbuild: require('esbuild/package.json').version };
results.paths = { scratch, esm: 'index.mjs', cjs: 'index.cjs', minified: 'index.min.mjs' };
const text = JSON.stringify(results, null, 2) + '\n';
assert(Buffer.byteLength(text) <= 5_000_000);
fs.writeFileSync(path.join(directory, 'bundle.json'), text, { flag: 'wx' });
console.log(`BUNDLE_REPORTED minify gzip ${results.minifyGzip.bytes} B; 비minify gzip ${results.plainGzip.bytes} B`);
