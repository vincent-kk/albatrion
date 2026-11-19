import { cpSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * r5-release, angles CA3 and EQ5: the published React declarations under the @types/react
 * releases a React 18 consumer can have.
 *
 * The built declarations name component results `import("react/jsx-runtime").JSX.Element`
 * (for example packages/canard/schema-form-antd5-plugin/dist/index.d.ts:2). @types/react
 * 18.0.0 to 18.2.5 ship `jsx-runtime.d.ts` as only `import './';` with no `JSX` export; 18.2.6
 * is the first 18.x that exports `JSX` from `react/jsx-runtime` (unpkg reads on 2026-11-20;
 * 17.0.75 and 16.14.60 also lack it, 17.0.80 has it).
 * The probe copies the installed @types/react 18.3.23 and replaces only its two runtime
 * declaration files with the 18.2.5 text below, so the single difference is that export.
 * It reads the workspace `dist` declarations built at the base commit.
 */
const repositoryRoot = resolve(__dirname, '../../../../../..');
const ts = createRequire(__filename)('typescript') as typeof import('typescript');
const react18Types = join(repositoryRoot, 'packages/aileron/development-helper/node_modules/@types/react');
const react18DomTypes = join(repositoryRoot, 'packages/aileron/development-helper/node_modules/@types/react-dom');
const RUNTIME_18_2_5 = "// Expose `JSX` namespace in `global` namespace\nimport './';\n";

const PACKAGES: Array<[string, string]> = [
  ['@canard/schema-form', 'packages/canard/schema-form'],
  ['@canard/schema-form-antd5-plugin', 'packages/canard/schema-form-antd5-plugin'],
  ['@canard/schema-form-antd6-plugin', 'packages/canard/schema-form-antd6-plugin'],
  ['@canard/schema-form-mui-plugin', 'packages/canard/schema-form-mui-plugin'],
  ['@canard/schema-form-antd-mobile-plugin', 'packages/canard/schema-form-antd-mobile-plugin'],
  ['@lerx/promise-modal', 'packages/lerx/promise-modal'],
  ['@winglet/react-utils/hoc', 'packages/winglet/react-utils'],
  ['@winglet/react-utils', 'packages/winglet/react-utils'],
];

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
