// Invoked by test:packaging after a build; the archive is the consumer's only package implementation.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import { createServer } from 'vite';

/** Emulated manifest shapes use the installed implementation; no React installation is fetched. */
const repository = fileURLToPath(new URL('../../../../../..', import.meta.url));
const require = createRequire(import.meta.url);
const installedReact = dirname(require.resolve('react/package.json'));
const installedReactDom = dirname(require.resolve('react-dom/package.json'));
const scratch = mkdtempSync(join(tmpdir(), 'react-packed-consumer-'));
const archive = join(scratch, 'package.tgz');

before(() => {
  const result = spawnSync('yarn', ['workspace', '@winglet/react-utils', 'pack', '--out', archive], { cwd: repository, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
after(() => rmSync(scratch, { recursive: true, force: true }));

for (const version of ['16.14.0', '17.0.2', '18.3.1', '19.2.6']) {
  test(`packed ESM, CommonJS and webpack resolve with an emulated React ${version} manifest`, async () => {
    const root = join(scratch, version);
    const modules = join(root, 'node_modules');
    const packed = join(modules, '@winglet/react-utils');
    mkdirSync(packed, { recursive: true });
    const extracted = spawnSync('tar', ['-xzf', archive, '--strip-components=1', '-C', packed], { encoding: 'utf8' });
    assert.equal(extracted.status, 0, extracted.stderr);
    const manifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'));
    assert.ok(!JSON.stringify(manifest.exports).includes('source'));
    assert.ok(!Object.keys(manifest.exports).some(key => key.includes('_runtime')));
    for (const [name, implementation] of [['react', installedReact], ['react-dom', installedReactDom]]) {
      const target = join(modules, name);
      mkdirSync(target, { recursive: true });
      const exports = Number(version.split('.')[0]) >= 18 && name === 'react'
        ? { '.': './index.js', './package.json': './package.json', './jsx-runtime': './jsx-runtime.js' } : undefined;
      writeFileSync(join(target, 'package.json'), JSON.stringify({ name, version, main: 'index.js', exports }));
      writeFileSync(join(target, 'index.js'), `module.exports = require(${JSON.stringify(implementation)});`);
      if (name === 'react') writeFileSync(join(target, 'jsx-runtime.js'), `module.exports = require(${JSON.stringify(join(implementation, 'jsx-runtime'))});`);
    }
    symlinkSync(join(repository, 'packages/winglet/common-utils'), join(modules, '@winglet/common-utils'), 'dir');
    const addresses = Object.keys(manifest.exports).map(key => '@winglet/react-utils' + (key === '.' ? '' : key.slice(1)));
    const script = `import assert from 'node:assert/strict'; import {createRequire} from 'node:module'; const require=createRequire(import.meta.url); for(const address of ${JSON.stringify(addresses)}) { await import(address); require(address); } await assert.rejects(import('@winglet/react-utils/dist/_runtime/react-jsx-runtime.cjs'), {code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});`;
    const node = spawnSync(process.execPath, ['--input-type=module', '--eval', script], { cwd: root, encoding: 'utf8' });
    assert.equal(node.status, 0, node.stderr);
    assert.ok(existsSync(join(packed, 'dist/_runtime/react-jsx-runtime.cjs')), 'package files include the private runtime bridge');
    writeFileSync(join(root, 'entry.js'), "import {withErrorBoundary} from '@winglet/react-utils/hoc'; console.log(typeof withErrorBoundary);\n");
    await new Promise((resolve, reject) => {
      const compiler = webpack({ context: root, mode: 'development', devtool: false, entry: './entry.js', output: { path: join(root, 'out'), filename: 'bundle.js' }, resolve: { modules: [modules] }, infrastructureLogging: { level: 'none' } });
      compiler.run((error, stats) => compiler.close(closeError => {
        if (error || closeError) { reject(error || closeError); return; }
        if (!stats) { reject(new Error('missing webpack stats')); return; }
        const errors = stats.toJson({ all: false, errors: true }).errors ?? [];
        if (errors.length) { reject(new Error(errors.map(error => error.message).join('\n'))); return; }
        resolve();
      }));
    });
    const alias = join(root, 'aliased-jsx-runtime.mjs');
    writeFileSync(alias, 'export const jsx = () => ({ aliasedRuntime: true }); export const jsxs = jsx; export const Fragment = Symbol.for(\"react.fragment\");');
    const entry = join(root, 'alias-entry.mjs');
    writeFileSync(entry, 'export {withErrorBoundary} from \"@winglet/react-utils/hoc\";');
    const server = await createServer({ root, configFile: false, resolve: { alias: [{ find: 'react/jsx-runtime', replacement: alias }] }, ssr: { noExternal: ['@winglet/react-utils'] }, server: { middlewareMode: true }, appType: 'custom' });
    try {
      const module = await server.ssrLoadModule(entry);
      const Wrapped = module.withErrorBoundary(() => null);
      assert.equal(Wrapped({}).aliasedRuntime, true, 'the published ESM graph honors the application JSX runtime alias');
    } finally { await server.close(); }
  });
}
