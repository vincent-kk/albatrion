// Packaging verification loads the generated public root with an early React 18 JSX runtime.
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import * as ts from 'typescript';
import { expect, it } from 'vitest';

it.each(['early', 'current'])(
  'round-5: published root supports %s React 18 runtime declarations', (runtime) => {
    const packageRoot = resolve(__dirname, '../..');
    const repositoryRoot = resolve(packageRoot, '../../..');
    const root = mkdtempSync(join(tmpdir(), 'plugin-react-types-'));
    const reactTypes = join(root, 'react-types');
    const helpers = join(repositoryRoot, 'packages/aileron/development-helper/node_modules/@types');
    cpSync(join(helpers, 'react'), reactTypes, { recursive: true });
    if (runtime === 'early')
      for (const file of ['jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts'])
        writeFileSync(join(reactTypes, file), "import './';\n");
    const consumer = join(root, 'consumer.mts');
    writeFileSync(consumer, `export * from '${packageRoot}/dist/index.js';`);
    const program = ts.createProgram([consumer], {
      module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022, strict: true, noEmit: true, skipLibCheck: false,
      types: [], jsx: ts.JsxEmit.ReactJSX, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      baseUrl: root, paths: {
        react: [join(reactTypes, 'index.d.ts')], 'react/*': [join(reactTypes, '*.d.ts')],
        'react-dom': [join(helpers, 'react-dom/index.d.ts')],
        'react-dom/*': [join(helpers, 'react-dom/*.d.ts')],
      },
    });
    const declarations = join(packageRoot, 'dist');
    expect(program.getSourceFiles().some((source) => source.fileName.startsWith(declarations))).toBe(true);
    expect(program.getSourceFiles().some((source) => source.fileName.startsWith(reactTypes))).toBe(true);
    const errors = ts.getPreEmitDiagnostics(program)
      .filter((error) => error.file?.fileName.startsWith(declarations))
      .map((error) => `TS${error.code}: ${ts.flattenDiagnosticMessageText(error.messageText, ' ')}`);
    expect(errors).toEqual([]);
  }, 120000,
);
