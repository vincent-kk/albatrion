/**
 * Build the four bundles that a behavior-preserving structural change is compared on (160C-01).
 *
 * Usage, from the repository root: `node packages/canard/schema-form/architecture/verification/07b/tools/build-identity-bundles.mjs <outDir>`
 * Writes `<outDir>/index.mjs` and `<outDir>/index.cjs` (the package's rolldown build, which also rewrites the
 * ignored `dist/`), `<outDir>/core.cjs` (the core verdict bundle with the oneOf-40 fixture extension of
 * prepare-patch-bundles.mjs) and `<outDir>/react.cjs` (prepare-react-bundles.mjs with the pair-126 entry and
 * the equivalent harness). Every bundle reads the working tree. Build the base by checking out the base
 * revision's copies of the changed source files, then restore the change; compare the two directories with
 * compare-normalized-bundles.mjs.
 */
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const worktree = resolve(packageRoot, '../../..');
const tools = resolve(packageRoot, 'architecture/verification/07-switch/tools');
const require = createRequire(resolve(packageRoot, 'package.json'));
const hash = value => createHash('sha256').update(value).digest('hex');
assert(process.argv[2], 'Usage: build-identity-bundles.mjs <outDir>');
const outputRoot = resolve(process.argv[2]);
mkdirSync(outputRoot, { recursive: true });

childProcess.execFileSync('npx', ['--no-install', 'rolldown', '-c'], { cwd: packageRoot, stdio: 'ignore', timeout: 240000 });
for (const name of ['index.mjs', 'index.cjs'])
  copyFileSync(resolve(packageRoot, 'dist', name), resolve(outputRoot, name));

delete require.cache[require.resolve('esbuild')];
const esbuild = require('esbuild');
const services = [];
const spawn = childProcess.spawn;
childProcess.spawn = function (...args) {
  const child = Reflect.apply(spawn, childProcess, args);
  if (String(args[0]).includes('esbuild') && args[1]?.some(arg => String(arg).startsWith('--service=')))
    services.push(child);
  return child;
};
let result;
try {
  result = await esbuild.build({ stdin: { contents: `
        export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
        export { blueprint } from './src/core/blueprint';
        export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
    loader: 'ts', resolveDir: packageRoot }, write: false, bundle: true,
    packages: 'external', platform: 'node', format: 'cjs',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'working-tree-sources', setup(builder) {
      builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
        const path = relative(worktree, args.path);
        if (!path.startsWith('packages/') || path.includes('node_modules')) return undefined;
        let contents = readFileSync(args.path, 'utf8');
        // The core verdict bundle measures the oneOf-40 fixture, as prepare-patch-bundles.mjs does.
        if (path === 'packages/aileron/benchmark-form/fixtures/equivalent/branches.ts') {
          assert.equal(contents.split('[5, 10, 20].map').length, 2);
          contents = contents.replace('[5, 10, 20].map', '[5, 10, 20, 40].map');
        }
        return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
      });
    } }] });
} finally {
  childProcess.spawn = spawn;
  for (const service of services) {
    service.ref();
    const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode]);
    service.stdin.end();
    const [code, signal] = await ended;
    assert.equal(code, 0, `esbuild natural exit: ${signal}`);
  }
}
const coreFile = resolve(outputRoot, 'core.cjs');
writeFileSync(coreFile, `require = require('node:module').createRequire(${JSON.stringify(resolve(packageRoot, 'package.json'))});\n`
  + result.outputFiles[0].text);

const { prepareReactBundles } = await import(pathToFileURL(resolve(tools, 'prepare-react-bundles.mjs')));
await prepareReactBundles(packageRoot, outputRoot, 'change', {
  entry: resolve(tools, 'measure-react-pair-126.entry.tsx'), equivalentHarness: true, outputNames: { change: 'react' },
});
for (const name of ['index.mjs', 'index.cjs', 'core.cjs', 'react.cjs']) {
  const code = readFileSync(resolve(outputRoot, name));
  console.log(JSON.stringify({ file: name, bytes: code.length, sha256: hash(code) }));
}
