// Loaded by the root build-script suite; fixtures exercise declaration format boundaries.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fixDtsExtensions } from '../utils/fixDtsExtensions.mjs';
import { getDeclarationEntries } from '../utils/getDeclarationEntries.mjs';
import { getBundleBuildOptions } from '../rolldown.bundle.mjs';
import { pathToFileURL } from 'node:url';

/** Creates files under the task scratch root and registers automatic cleanup. */
function fixture(context, files) {
  mkdirSync('/tmp/bb3-build', { recursive: true });
  const root = mkdtempSync('/tmp/bb3-build/declarations-');
  context.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  return root;
}

test('manifest opt-in copies the entire graph including ambient dependencies without changing ESM bytes', async (context) => {
  const { emitCommonJsDeclarations } = await import('../utils/emitCommonJsDeclarations.mjs');
  const source = "export type Value = import('./internal.js').Value;";
  const root = fixture(context, { 'index.d.ts': source, 'internal.d.ts': 'export type Value = string;', '@aileron/declare/index.d.ts': 'export type Ambient = number;' });
  assert.equal(emitCommonJsDeclarations(root, { exports: { '.': { types: './index.d.ts' } } }), 0);
  assert.equal(emitCommonJsDeclarations(root, { exports: { '.': { require: { types: './index.d.cts' } } } }), 3);
  assert.equal(readFileSync(join(root, 'index.d.ts'), 'utf8'), source);
  assert.equal(readFileSync(join(root, 'index.d.cts'), 'utf8'), "export type Value = import('./internal.cjs').Value;");
  assert.equal(readFileSync(join(root, '@aileron/declare/index.d.cts'), 'utf8'), 'export type Ambient = number;');
});

test('CJS rewrites syntax and reference paths while preserving ordinary comments and literal types', (context) => {
  const source = [
    '/// <reference path="./ambient.d.ts" />',
    "import value = require('./value.js');",
    "export { Value } from './value.d.ts';",
    "export type Inline = import('./value').Value;",
    "export * from './directory/';",
    "import './ambient';",
    "// import('./value.js') is prose",
    'export type Label = "import(\'./value.js\')";',
    'export type Path = "./value.js";',
  ].join('\n');
  const root = fixture(context, { 'consumer.d.cts': source, 'value.d.cts': 'export type Value = string;', 'directory/index.d.cts': 'export {};', 'ambient.d.cts': 'export {};' });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.cts'), 'utf8'), source
    .replace('path="./ambient.d.ts"', 'path="./ambient.d.cts"')
    .replace("require('./value.js')", "require('./value.cjs')")
    .replace("from './value.d.ts'", "from './value.cjs'")
    .replace("import('./value').Value", "import('./value.cjs').Value")
    .replace("from './directory/'", "from './directory/index.cjs'")
    .replace("import './ambient'", "import './ambient.cjs'"));
  assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
});

test('enumerates both nested declaration branches for every public subpath', () => {
  const target = { import: { types: './index.d.ts', default: './index.mjs' }, require: { types: './index.d.cts', default: './index.cjs' } };
  const result = getDeclarationEntries({ name: 'fixture', exports: { '.': target, './sub': target } });
  assert.deepEqual(result.entries, [['.', { import: './index.d.ts', require: './index.d.cts' }], ['./sub', { import: './index.d.ts', require: './index.d.cts' }]]);
  assert.throws(() => getDeclarationEntries({ name: 'fixture', exports: { './*': target } }), /wildcard/);
});

test('bundle path conditions keep precisely the same options as string paths', async () => {
  const { bundleBuildOptions } = getBundleBuildOptions(pathToFileURL('/tmp/bb3-build/fixture/rolldown.config.mjs').href);
  const options = { entry: 'src/index.ts', format: 'esm', outFile: './dist/index.mjs' };
  const original = await bundleBuildOptions(options);
  const nested = await bundleBuildOptions({ ...options, outFile: { types: './dist/index.d.ts', default: options.outFile } });
  assert.equal(nested.output.file, original.output.file);
  assert.deepEqual({ ...nested, plugins: [] }, { ...original, plugins: [] });
});


test('CJS handles ESM and declaration extensions but keeps asset paths', (context) => {
  const root = fixture(context, {
    'consumer.d.cts': "export * from './value.mjs';\nexport * from './value.d.mts';\nimport './data.json';\nimport './style.css';",
    'value.d.cts': 'export {};', 'data.json.d.cts': 'export {};', 'style.css.d.cts': 'export {};',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.cts'), 'utf8'), "export * from './value.cjs';\nexport * from './value.cjs';\nimport './data.json';\nimport './style.css';");
});

test('published declaration branches reject source conditions, branch drift and incorrect ordering', async () => {
  const { validatePublishedDeclarations } = await import('../utils/validatePublishedDeclarations.mjs');
  const entry = { import: { types: './index.d.ts', default: './index.mjs' }, require: { types: './index.d.cts', default: './index.cjs' } };
  const manifest = { name: 'fixture', exports: { '.': entry }, publishConfig: { exports: { '.': entry } } };
  assert.doesNotThrow(() => validatePublishedDeclarations(manifest));
  assert.throws(() => validatePublishedDeclarations({ ...manifest, publishConfig: { exports: { '.': { source: './src/index.ts', ...entry } } } }), /source/);
  assert.throws(() => validatePublishedDeclarations({ ...manifest, publishConfig: { exports: { '.': { ...entry, require: { types: './wrong.d.cts' } } } } }), /differ/);
  assert.throws(() => validatePublishedDeclarations({ ...manifest, publishConfig: { exports: { '.': { ...entry, import: { default: './index.mjs', types: './index.d.ts' } } } } }), /types first/);
});


test('the canonical repair step ignores stale CJS companions that emission will replace', (context) => {
  const root = fixture(context, { 'index.d.ts': "export * from './value';", 'value.d.ts': 'export {};', 'stale.d.cts': "export * from './value';", 'value.d.cts': 'export {};' });
  fixDtsExtensions(root, { declarationFormat: 'esm' });
  assert.equal(readFileSync(join(root, 'index.d.ts'), 'utf8'), "export * from './value.js';");
  assert.equal(readFileSync(join(root, 'stale.d.cts'), 'utf8'), "export * from './value';");
});
