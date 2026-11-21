import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageDir = resolve(__dirname, '../../..');
const repositoryRoot = resolve(packageDir, '../../..');
const ts = createRequire(__filename)('typescript') as typeof import('typescript');

/**
 * A consumer of the package ROOT only, the address that round 3's known limit says
 * still resolves through the top-level `types` field under moduleResolution node10.
 */
const checkRootConsumer = (
  moduleKind: import('typescript').ModuleKind,
  moduleResolution: import('typescript').ModuleResolutionKind,
  type: 'module' | 'commonjs',
) => {
  const root = mkdtempSync(join(tmpdir(), 'r4-contracts-node10-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type }));
  for (const [name, dir] of [
    ['@winglet/json-schema', 'packages/winglet/json-schema'],
    ['@winglet/common-utils', 'packages/winglet/common-utils'],
    ['@winglet/json', 'packages/winglet/json'],
  ]) {
    const link = join(root, 'node_modules', name);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(join(repositoryRoot, dir), link, 'dir');
  }
  const file = join(root, 'index.ts');
  // `group` is a public member that JSONSchemaScanError inherits from BaseError.
  writeFileSync(
    file,
    "import { JSONSchemaScanError } from '@winglet/json-schema';\n" +
      'export const groupOf = (error: JSONSchemaScanError): string => error.group;\n',
  );
  const program = ts.createProgram([file], {
    module: moduleKind,
    moduleResolution,
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts'],
    types: [],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  });
  return ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) => `TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ').slice(0, 90)}`);
};

describe('r4-contracts json-schema root declarations under moduleResolution node10', () => {
  it('control: a node16 ESM consumer reads the inherited BaseError member', () => {
    expect(checkRootConsumer(ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16, 'module')).toEqual([]);
  });

  it('a node10 consumer of the package root reads the inherited BaseError member', () => {
    expect(checkRootConsumer(ts.ModuleKind.CommonJS, ts.ModuleResolutionKind.Node10, 'commonjs')).toEqual([]);
  });
});
