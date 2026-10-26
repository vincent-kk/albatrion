/**
 * The package entry point defines the consumer surface; this test reads it without importing it.
 * Alias resolution and unqualified type text keep the snapshot independent of internal file locations.
 */
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** Package root located relative to this test rather than a particular checkout. */
const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Loads the package's own compiler options without emitting files.
 * @returns Parsed compiler options, preserving package aliases and inherited settings.
 * @throws When the package configuration cannot be read or parsed.
 */
function readCompilerOptions(): ts.CompilerOptions {
  const configPath = join(packageRoot, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
    );
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    packageRoot,
  );
  if (parsed.errors.length)
    throw new Error(
      parsed.errors
        .map((error) =>
          ts.flattenDiagnosticMessageText(error.messageText, '\n'),
        )
        .join('\n'),
    );
  return { ...parsed.options, noEmit: true };
}

/**
 * Describes a root export using its resolved symbol and path-independent type text.
 * @param exported - Symbol enumerated from the package entry module.
 * @param checker - Checker for the package entry's compiler program.
 * @param entry - Entry source used as the fallback symbol location.
 * @returns One tab-separated name, value/type kind and complete type string.
 */
function describeExport(
  exported: ts.Symbol,
  checker: ts.TypeChecker,
  entry: ts.SourceFile,
): string {
  let symbol = exported;
  while (symbol.flags & ts.SymbolFlags.Alias)
    symbol = checker.getAliasedSymbol(symbol);
  const hasValue = (symbol.flags & ts.SymbolFlags.Value) !== 0;
  const hasType = (symbol.flags & ts.SymbolFlags.Type) !== 0;
  const kind = hasValue ? (hasType ? 'value+type' : 'value') : 'type';
  const type = hasValue
    ? checker.getTypeOfSymbolAtLocation(
        symbol,
        symbol.valueDeclaration ?? entry,
      )
    : checker.getDeclaredTypeOfSymbol(symbol);
  const typeText = checker.typeToString(
    type,
    undefined,
    ts.TypeFormatFlags.NoTruncation,
  );
  return `${exported.getName()}\t${kind}\t${typeText}`;
}

it('preserves the 95-name package public surface', () => {
  const entryPath = join(packageRoot, 'src/index.ts');
  const program = ts.createProgram([entryPath], readCompilerOptions());
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  if (!entry) throw new Error('Package entry source is missing');
  const module = checker.getSymbolAtLocation(entry);
  if (!module) throw new Error('Package entry module symbol is missing');
  const lines = checker
    .getExportsOfModule(module)
    .map((symbol) => describeExport(symbol, checker, entry))
    .sort();
  expect(lines).toHaveLength(95);
  expect(lines.join('\n')).toMatchSnapshot();
}, 60000);
