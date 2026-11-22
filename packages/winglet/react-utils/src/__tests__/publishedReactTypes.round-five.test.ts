// Packaging verification reads the built declaration graph with an emulated early React 18 JSX runtime.
import { cpSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import * as ts from 'typescript';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../../../..');
const react18Types = join(repositoryRoot, 'packages/aileron/development-helper/node_modules/@types/react');
const react18DomTypes = join(repositoryRoot, 'packages/aileron/development-helper/node_modules/@types/react-dom');
const RUNTIME_18_2_5 = "// Expose `JSX` namespace in `global` namespace\nimport './';\n";

const PACKAGES: Array<[string, string]> = [['@winglet/react-utils', 'packages/winglet/react-utils']];

const typeCheck = (runtimeFiles: '18.2.5' | '18.3.23') => {
  const root = mkdtempSync(join(tmpdir(), `r5-release-types-react-${runtimeFiles}-`));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  const reactTypes = join(root, 'types-react');
  cpSync(react18Types, reactTypes, { recursive: true });
  if (runtimeFiles === '18.2.5')
    for (const file of ['jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts'])
      writeFileSync(join(reactTypes, file), RUNTIME_18_2_5);
  for (const [name, dir] of PACKAGES) {
    const packageName = name.split('/').slice(0, 2).join('/');
    const target = join(root, 'node_modules', packageName);
    mkdirSync(dirname(target), { recursive: true });
    try {
      symlinkSync(join(repositoryRoot, dir), target, 'dir');
    } catch {
      /* linked by an earlier subpath entry */
    }
  }
  const file = join(root, 'consumer.mts');
  writeFileSync(file, PACKAGES.map(([name], index) => `export * as p${index} from '${name}';`).join('\n'));
  const program = ts.createProgram([file], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    types: [],
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    baseUrl: root,
    paths: {
      react: [join(reactTypes, 'index.d.ts')],
      'react/*': [join(reactTypes, '*.d.ts')],
      'react-dom': [join(react18DomTypes, 'index.d.ts')],
      'react-dom/*': [join(react18DomTypes, '*.d.ts')],
    },
  });
  const loaded = program.getSourceFiles().map((source) => source.fileName);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName.includes('/dist/'))
    .map(
      (diagnostic) =>
        `${relative(repositoryRoot, diagnostic.file!.fileName).split('/').slice(0, 3).join('/')} TS${diagnostic.code}`,
    );
  return {
    reactTypesLoaded: loaded.some((name) => name.startsWith(reactTypes)),
    perPackage: [...new Set(diagnostics)].sort(),
    count: diagnostics.length,
  };
};

describe('r5-release React declarations under @types/react 18.0 to 18.2.5', () => {
  it('the published React declarations type-check with @types/react 18.2.5 (skipLibCheck false)', () => {
    const result = typeCheck('18.2.5');
    expect(result.reactTypesLoaded).toBe(true);
    expect(result.perPackage).toEqual([]);
  }, 120_000);

  it('control: the same consumer type-checks with the unmodified @types/react 18.3.23', () => {
    const result = typeCheck('18.3.23');
    expect(result.reactTypesLoaded).toBe(true);
    expect(result.perPackage).toEqual([]);
  }, 120_000);
});
