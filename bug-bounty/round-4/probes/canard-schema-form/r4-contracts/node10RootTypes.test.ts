import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageDir = resolve(__dirname, '../../..');
const repositoryRoot = resolve(packageDir, '../../..');
const ts = createRequire(__filename)('typescript') as typeof import('typescript');

/**
 * Type-checks a consumer of the package ROOT, the address that round 3's known
 * limit says still resolves through the top-level `types` field under node10.
 * `FormHandle.submit` is declared as `TrackableHandlerFunction`, which the root
 * declarations import from the `@winglet/common-utils/function` subpath.
 */
const checkRootConsumer = (
  moduleKind: import('typescript').ModuleKind,
  moduleResolution: import('typescript').ModuleResolutionKind,
  type: 'module' | 'commonjs',
) => {
  const root = mkdtempSync(join(tmpdir(), 'r4-contracts-node10-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type }));
  const modules = join(root, 'node_modules');
  mkdirSync(modules, { recursive: true });
  for (const [name, dir] of [
    ['@canard/schema-form', 'packages/canard/schema-form'],
    ['@winglet/common-utils', 'packages/winglet/common-utils'],
    ['@winglet/json', 'packages/winglet/json'],
    ['@winglet/json-schema', 'packages/winglet/json-schema'],
    ['@winglet/react-utils', 'packages/winglet/react-utils'],
    ['react', 'node_modules/react'],
    ['@types/react', 'node_modules/@types/react'],
    ['csstype', 'node_modules/csstype'],
  ]) {
    const link = join(modules, name);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(join(repositoryRoot, dir), link, 'dir');
  }
  const file = join(root, 'index.ts');
  writeFileSync(
    file,
    "import type { FormHandle } from '@canard/schema-form';\n" +
      'declare const handle: FormHandle;\n' +
      '// A function is not a number: a typed submit makes this line an error.\n' +
      'export const notANumber: number = handle.submit;\n',
  );
  const program = ts.createProgram([file], {
    module: moduleKind,
    moduleResolution,
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName === file)
    .map((diagnostic) => `TS${diagnostic.code}`);
};

describe('r4-contracts schema-form root declarations under moduleResolution node10', () => {
  it('control: a bundler consumer sees FormHandle.submit typed (assigning it to number is TS2322)', () => {
    expect(
      checkRootConsumer(ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler, 'module'),
    ).toEqual(['TS2322']);
  });

  it('a node10 consumer of the package root sees FormHandle.submit typed, not any', () => {
    expect(
      checkRootConsumer(ts.ModuleKind.CommonJS, ts.ModuleResolutionKind.Node10, 'commonjs'),
    ).toEqual(['TS2322']);
  });
});
