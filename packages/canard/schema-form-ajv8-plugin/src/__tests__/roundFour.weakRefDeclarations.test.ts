import { join, resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('preserves the weakref library dependency in emitted public-reachable declarations', () => {
  const packageDir = resolve(__dirname, '../..');
  const parsed = ts.getParsedCommandLineOfConfigFile(
    join(packageDir, 'tsconfig.declarations.json'),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  if (!parsed) throw new Error('Declaration configuration did not parse');
  const source = join(packageDir, 'src/validator/utils/registerSchemaRoot.ts');
  const program = ts.createProgram([source], {
    ...parsed.options,
    noEmit: false,
  });
  let emitted = '';
  program.emit(
    undefined,
    (name, text) => {
      if (name.endsWith('registerSchemaRoot.d.ts')) emitted = text;
    },
    undefined,
    true,
  );
  expect(emitted).toContain('reference lib="es2021.weakref"');
});
