// Run once with the shared build suite through the root test:build-scripts command.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';

import { fixDtsExtensions } from '../utils/fixDtsExtensions.mjs';

test('resolves static and inline references to files and current/parent indexes', () => {
  const root = mkdtempSync(join(tmpdir(), 'declaration-paths-'));
  try {
    for (const name of ['index.d.ts', 'value.d.ts', 'nested/index.d.ts', 'nested/deep/index.d.ts']) {
      mkdirSync(dirname(join(root, name)), { recursive: true });
      writeFileSync(join(root, name), 'export type Value = string;\n');
    }
    const file = join(root, 'nested/deep/consumer.d.ts');
    const source = [
      "export { Value } from '../../value';",
      "export type A = import('../../value').Value;",
      "export type B = import('.').Value;",
      "export type C = import('..').Value;",
      "export type D = import('../..').Value;",
      "export { Value as E } from '..';",
      "export type External = import('external-package').Value;",
      "export type Existing = import('../../value.js').Value;",
      "export type Missing = import('./missing').Value;",
    ].join('\n');
    writeFileSync(file, source);
    assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 1, importsFixed: 6 });
    assert.equal(readFileSync(file, 'utf8'), source
      .replaceAll("'../../value'", "'../../value.js'")
      .replaceAll("'.'", "'./index.js'")
      .replaceAll("'..'", "'../index.js'")
      .replaceAll("'../..'", "'../../index.js'"));
    assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/** Creates declaration fixtures with cleanup owned by the node:test context. */
function createFixture(context, files) {
  const root = mkdtempSync(join(tmpdir(), 'declaration-syntax-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  return root;
}

test('rewrites relative side-effect imports', (context) => {
  const root = createFixture(context, {
    'consumer.d.ts': "import './polyfill';\n",
    'polyfill.d.ts': 'export {};\n',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.ts'), 'utf8'), "import './polyfill.js';\n");
});

test('uses .mjs for a .d.mts file target', (context) => {
  const root = createFixture(context, {
    'consumer.d.mts': "export type Value = import('./value').Value;\n",
    'value.d.mts': 'export type Value = string;\n',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.mts'), 'utf8'), "export type Value = import('./value.mjs').Value;\n");
});

test('resolves directories containing index.d.mts', (context) => {
  const root = createFixture(context, {
    'consumer.d.ts': "export { Value } from './esm';\n",
    'esm/index.d.mts': 'export type Value = string;\n',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.ts'), 'utf8'), "export { Value } from './esm/index.mjs';\n");
});

test('does not duplicate an existing trailing directory slash', (context) => {
  const root = createFixture(context, {
    'consumer.d.ts': "export { Value } from './utils/';\n",
    'utils/index.d.ts': 'export type Value = string;\n',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.ts'), 'utf8'), "export { Value } from './utils/index.js';\n");
});

test('preserves import-looking string literal types and comments', (context) => {
  const source = [
    "/** import('./value') and from './value' are documentation. */",
    'export type Label = "import(\'./value\')";',
    'export type Instruction = "from \'./value\'";',
  ].join('\n');
  const root = createFixture(context, {
    'consumer.d.ts': source,
    'value.d.ts': 'export type Value = string;\n',
  });
  fixDtsExtensions(root);
  assert.equal(readFileSync(join(root, 'consumer.d.ts'), 'utf8'), source);
});

test('dot directory specifiers ignore adjacent declaration files', (context) => {
  for (const extension of ['ts', 'mts']) {
    const source = ['.', './', '..', '../', '../..'].map((path) => `export * from '${path}';`).join('\n');
    const root = createFixture(context, {
      [`src/utils/consumer.d.${extension}`]: source,
      [`src/utils/index.d.${extension}`]: 'export {};',
      [`src/index.d.${extension}`]: 'export {};',
      [`index.d.${extension}`]: 'export {};',
      [`src/utils.d.${extension}`]: 'export {};',
      [`src.d.${extension}`]: 'export {};',
    });
    fixDtsExtensions(root);
    const runtimeExtension = extension === 'ts' ? 'js' : 'mjs';
    assert.equal(readFileSync(join(root, `src/utils/consumer.d.${extension}`), 'utf8'),
      ['./index', './index', '../index', '../index', '../../index']
        .map((path) => `export * from '${path}.${runtimeExtension}';`).join('\n'));
    assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
  }
});

test('rewrites import equals external module references', (context) => {
  const source = [
    "import foo = require('./foo');",
    'import esm = require("./esm");',
    "import directory = require('./directory/');",
    "import external = require('external-package');",
    'import alias = foo.Value;',
  ].join('\n');
  const root = createFixture(context, {
    'consumer.d.ts': source,
    'foo.d.ts': 'export type Value = string;',
    'esm.d.mts': 'export {};',
    'directory/index.d.ts': 'export {};',
  });
  assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 1, importsFixed: 3 });
  assert.equal(readFileSync(join(root, 'consumer.d.ts'), 'utf8'), source
    .replace("'./foo'", "'./foo.js'")
    .replace('"./esm"', '"./esm.mjs"')
    .replace("'./directory/'", "'./directory/index.js'"));
  assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
});

test('rewrites reference path directives to actual declarations', (context) => {
  const source = [
    '/// <reference path="./types" />',
    "/// <reference path='./esm' />",
    '/// <reference path="./directory" />',
    '/// <reference path="./esm-directory/" />',
    '/// <reference path="./existing.d.ts" />',
    "import './module';",
    '// <reference path="./types" /> is ordinary commentary.',
    'export {};',
  ].join('\n');
  const root = createFixture(context, {
    'consumer.d.ts': source,
    'types.d.ts': 'interface FixtureType {}',
    'esm.d.mts': 'export {};',
    'directory/index.d.ts': 'interface DirectoryType {}',
    'esm-directory/index.d.mts': 'export {};',
    'existing.d.ts': 'interface ExistingType {}',
    'module.d.ts': 'export {};',
  });
  assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 1, importsFixed: 5 });
  const file = join(root, 'consumer.d.ts');
  assert.equal(readFileSync(file, 'utf8'), source
    .replace('path="./types"', 'path="./types.d.ts"')
    .replace("path='./esm'", "path='./esm.d.mts'")
    .replace('path="./directory"', 'path="./directory/index.d.ts"')
    .replace('path="./esm-directory/"', 'path="./esm-directory/index.d.mts"')
    .replace("'./module'", "'./module.js'"));
  const program = ts.createProgram([file], {
    noEmit: true, types: [], module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map((diagnostic) => diagnostic.messageText), []);
  assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
});
