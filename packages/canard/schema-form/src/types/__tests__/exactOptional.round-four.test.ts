import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageDir = resolve(__dirname, '../../..');
const ts = createRequire(__filename)(
  'typescript',
) as typeof import('typescript');

/**
 * Type-checks the schema type modules that `dist/types/schema/jsonSchema.d.ts` and `value.d.ts`
 * are emitted from, with the package's own compiler options plus one consumer flag.
 */
const schemaTypeDiagnostics = (exactOptionalPropertyTypes: boolean) => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    resolve(packageDir, 'tsconfig.json'),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  if (!parsed) throw new Error('tsconfig.json did not parse');
  const files = [
    'src/types/schema/jsonSchema.ts',
    'src/types/schema/value.ts',
  ].map((file) => resolve(packageDir, file));
  const program = ts.createProgram(files, {
    ...parsed.options,
    composite: false,
    declaration: false,
    emitDeclarationOnly: false,
    noEmit: true,
    exactOptionalPropertyTypes,
  });
  return ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) =>
        diagnostic.file && files.includes(diagnostic.file.fileName),
    )
    .map(
      (diagnostic) =>
        `TS${diagnostic.code} ${diagnostic.file!.fileName.slice(packageDir.length + 1)}:${
          diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start!)
            .line + 1
        }`,
    );
};

describe('r4-contracts schema type declarations under exactOptionalPropertyTypes', () => {
  it('control: the schema type modules type-check with the package options', () => {
    expect(schemaTypeDiagnostics(false)).toEqual([]);
  });

  it('the schema type modules type-check for a consumer that enables exactOptionalPropertyTypes', () => {
    expect(schemaTypeDiagnostics(true)).toEqual([]);
  });
});
