import { resolve } from 'node:path';
import * as ts from 'typescript';
import { expect, it } from 'vitest';

const consumer = resolve(__dirname, '../../public-consumer.mts');
const imports = `
  import type { FormHandle, InferValueType, JSONSchema } from '@canard/schema-form';
  const schema = { type: 'string', title: undefined } as const satisfies JSONSchema;
  export const value: InferValueType<typeof schema> = 'value';
  export type Result = ReturnType<FormHandle['submit']>;
`;

it.each([
  [ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler],
  [ts.ModuleKind.CommonJS, ts.ModuleResolutionKind.Node10],
] as const)(
  'resolves the public declaration with TypeScript resolution %s / %s',
  (module, moduleResolution) => {
    const options: ts.CompilerOptions = {
      module,
      moduleResolution,
      target: ts.ScriptTarget.ES2022,
      strict: true,
      exactOptionalPropertyTypes: true,
      noEmit: true,
      types: [],
    };
    const host = ts.createCompilerHost(options);
    const readSource = host.getSourceFile.bind(host);
    host.getSourceFile = (file, target, onError, shouldCreateNewSourceFile) =>
      file === consumer
        ? ts.createSourceFile(file, imports, target)
        : readSource(file, target, onError, shouldCreateNewSourceFile);
    const program = ts.createProgram([consumer], options, host);
    expect(
      program
        .getSourceFiles()
        .some((file) => file.fileName.endsWith('/schema-form/dist/index.d.ts')),
    ).toBe(true);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (moduleResolution === ts.ModuleResolutionKind.Bundler) {
      expect(
        diagnostics.map((item) =>
          ts.flattenDiagnosticMessageText(item.messageText, '\n'),
        ),
      ).toEqual([]);
    } else {
      expect(
        diagnostics.some(
          (item) =>
            item.code === 2307 &&
            ts
              .flattenDiagnosticMessageText(item.messageText, '\n')
              .includes('@winglet/'),
        ),
      ).toBe(true);
    }
  },
);
