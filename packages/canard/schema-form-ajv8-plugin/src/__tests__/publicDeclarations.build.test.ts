import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('loads the published declarations for every dialect under ES2020 in ESM and CommonJS', () => {
  const source = ['ajv8-plugin', 'ajv8-plugin/2019', 'ajv8-plugin/2020']
    .map(
      (entry, index) =>
        `export { createValidatorFactory as factory${index} } from '@canard/schema-form-${entry}';`,
    )
    .join('\n');
  const directory = dirname(fileURLToPath(import.meta.url));
  const consumers = ['mts', 'cts'].map((extension) =>
    join(directory, `declaration-consumer.${extension}`),
  );
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    target: ts.ScriptTarget.ES2020,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
    types: [],
    skipLibCheck: false,
  };
  const host = ts.createCompilerHost(options);
  const { getSourceFile } = host;
  host.getSourceFile = (path, languageVersion, ...rest) =>
    consumers.includes(path)
      ? ts.createSourceFile(path, source, languageVersion)
      : getSourceFile(path, languageVersion, ...rest);

  const diagnostics = consumers.flatMap((consumer) =>
    ts.getPreEmitDiagnostics(ts.createProgram([consumer], options, host)),
  );

  expect(
    ts.formatDiagnostics(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (path) => path,
      getNewLine: () => '\n',
    }),
  ).toBe('');
}, 15000);
