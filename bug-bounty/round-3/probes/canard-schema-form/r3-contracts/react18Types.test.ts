import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

import { expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../../../../..');
const ts = createRequire(__filename)('typescript') as typeof import('typescript');
/** @types/react 18.3.x, installed for the private development helper workspace. */
const react18Types = join(
  repositoryRoot,
  'packages/aileron/development-helper/node_modules/@types/react',
);
const react18DomTypes = join(
  repositoryRoot,
  'packages/aileron/development-helper/node_modules/@types/react-dom',
);

const PACKAGES: Array<[string, string]> = [
  ['@canard/schema-form', 'packages/canard/schema-form'],
  ['@lerx/promise-modal', 'packages/lerx/promise-modal'],
  ['@winglet/react-utils', 'packages/winglet/react-utils'],
];

it('the React package declarations type-check for a React 18 consumer, which the peer range admits', () => {
  const root = mkdtempSync(join(tmpdir(), 'r3-contracts-react18-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  for (const [name, dir] of PACKAGES) {
    const target = join(root, 'node_modules', name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(join(repositoryRoot, dir), target, 'dir');
  }
  const file = join(root, 'index.ts');
  writeFileSync(
    file,
    PACKAGES.map(([name], index) => `export * as p${index} from '${name}';`).join('\n'),
  );
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
      react: [react18Types],
      'react/*': [react18Types + '/*'],
      'react-dom': [react18DomTypes],
      'react-dom/*': [react18DomTypes + '/*'],
    },
  });
  expect(ts.version).toMatch(/^5\./);
  const reactVersion = createRequire(join(react18Types, 'package.json'))(
    join(react18Types, 'package.json'),
  ).version;
  expect(reactVersion).toMatch(/^18\./);
  const loaded = program.getSourceFiles().map((source) => source.fileName);
  // Control: the React 18 typings and the published declarations are what was checked.
  expect(loaded.some((name) => name.startsWith(react18Types))).toBe(true);
  expect(loaded.some((name) => /node_modules\/@types\/react\/index\.d\.ts$/.test(name) && !name.startsWith(react18Types))).toBe(false);
  expect(loaded.filter((name) => name.includes('/packages/') && name.includes('/dist/')).length).toBeGreaterThan(50);
  const ours = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName.includes('/packages/'))
    .map(
      (diagnostic) =>
        `${relative(repositoryRoot, diagnostic.file!.fileName)} TS${diagnostic.code} ${ts
          .flattenDiagnosticMessageText(diagnostic.messageText, ' ')
          .slice(0, 140)}`,
    );
  expect(ours).toEqual([]);
});
