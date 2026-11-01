// Loaded by preparation; follows re-exports from the built package entry.
import assert from 'node:assert/strict';
import path from 'node:path';
import ts from 'typescript';

/**
 * Describe every public built export using unqualified, complete type text.
 * @param {string} packageDir Package with built declarations and its compiler configuration.
 * @returns {string} Sorted name/kind/type lines independent of internal declaration paths.
 */
export function readPublicDeclarations(packageDir) {
  packageDir = path.resolve(packageDir);
  const config = ts.readConfigFile(
    path.join(packageDir, 'tsconfig.json'),
    ts.sys.readFile,
  );
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    packageDir,
  );
  assert.equal(parsed.errors.length, 0);
  const entryPath = path.join(packageDir, 'dist/index.d.ts');
  const program = ts.createProgram([entryPath], {
    ...parsed.options,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  assert.ok(entry);
  const module = checker.getSymbolAtLocation(entry);
  assert.ok(module);
  return checker
    .getExportsOfModule(module)
    .map((exported) => {
      let symbol = exported;
      while (symbol.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol);
      const hasValue = (symbol.flags & ts.SymbolFlags.Value) !== 0;
      const hasType = (symbol.flags & ts.SymbolFlags.Type) !== 0;
      const type = hasValue
        ? checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration ?? entry,
          )
        : checker.getDeclaredTypeOfSymbol(symbol);
      const kind = hasValue ? (hasType ? 'value+type' : 'value') : 'type';
      return `${exported.getName()}\t${kind}\t${checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation)}`;
    })
    .sort()
    .join('\n')
    .replaceAll(packageDir, '<package>');
}
