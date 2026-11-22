import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

import { expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../../../..');


const PACKAGES: Array<[string, string]> = [
  ['@winglet/common-utils', 'packages/winglet/common-utils'],
];

/**
 * Type-check a consumer that imports every non-React utility package with the given globals.
 * @returns Diagnostics located in the packages' published declarations.
 */
const check = (lib: string[], ambient?: string) => {
  const root = mkdtempSync(join(tmpdir(), 'r3-contracts-neutral-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  for (const [name, dir] of PACKAGES) {
    const target = join(root, 'node_modules', name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(join(repositoryRoot, dir), target, 'dir');
  }
  const files = [join(root, 'index.ts')];
  writeFileSync(
    files[0],
    PACKAGES.map(([name], index) => `export * as p${index} from '${name}';`).join('\n'),
  );
  if (ambient) {
    files.push(join(root, 'ambient.d.ts'));
    writeFileSync(files[1], ambient);
  }
  const program = ts.createProgram(files, {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    types: [],
    lib,
  });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName.includes('/packages/'))
    .map(
      (diagnostic) =>
        `${relative(repositoryRoot, diagnostic.file!.fileName)} TS${diagnostic.code} ${ts
          .flattenDiagnosticMessageText(diagnostic.messageText, ' ')
          .slice(0, 80)}`,
    );
};

it('control: with the DOM library the utility declarations type-check', () => {
  expect(check(['lib.es2022.d.ts', 'lib.dom.d.ts'])).toEqual([]);
});

it('the utility declarations type-check for a platform-neutral consumer (lib ES2022, no DOM, no Node types)', () => {
  expect(check(['lib.es2022.d.ts'])).toEqual([]);
});

it('the utility declarations type-check with the Node 18 globals (@types/node 18 declares Blob and AbortSignal, not File)', () => {
  // Minimal stand-in for the @types/node 18 globals the declarations touch; File arrived in @types/node 20.
  const node18Globals = `
    declare global {
      interface Blob { readonly size: number; readonly type: string }
      var Blob: { prototype: Blob; new (): Blob };
      interface AbortSignal { readonly aborted: boolean }
      var AbortSignal: { prototype: AbortSignal; new (): AbortSignal };
    }
    export {};
  `;
  expect(check(['lib.es2022.d.ts'], node18Globals)).toEqual([]);
});
