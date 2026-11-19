import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import * as ts from 'typescript';

/**
 * Compile a consumer through the built public package entry point.
 * @param source Consumer TypeScript program.
 * @param options Compiler settings added to strict declaration checking.
 * @returns Formatted compiler diagnostics, cleaning the isolated consumer afterward.
 */
export function checkSchemaConsumer(source: string, options: ts.CompilerOptions): string[] {
  const repository = resolve(__dirname, '../../../../../..');
  const root = mkdtempSync(join(tmpdir(), 'schema-consumer-'));
  try {
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    for (const name of ['json-schema', 'common-utils', 'json']) {
      const link = join(root, 'node_modules/@winglet', name);
      mkdirSync(dirname(link), { recursive: true });
      symlinkSync(join(repository, 'packages/winglet', name), link, 'dir');
    }
    const file = join(root, 'index.ts'); writeFileSync(file, source);
    const program = ts.createProgram([file], { module: ts.ModuleKind.Node16, moduleResolution: ts.ModuleResolutionKind.Node16, target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], types: [], strict: true, skipLibCheck: false, noEmit: true, ...options });
    return ts.getPreEmitDiagnostics(program).map(diagnostic => `TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
