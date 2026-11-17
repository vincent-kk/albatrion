import { dirname, join } from 'node:path';
import ts from 'typescript';

/**
 * Reads exported names and their direct members through the compiler's symbol graph.
 * @param entryPath - Published declaration or current public source entry.
 * @param packageRoot - Current package root, supplying compiler aliases for source.
 * @returns Export/member paths, including callable return keys under `name()`.
 * @throws If compiler configuration or the public entry cannot be resolved.
 */
export function readDeclarationSurface(
  entryPath: string,
  packageRoot: string,
): Map<string, string[]> {
  const configPath = join(packageRoot, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error('Cannot read package compiler configuration');
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    dirname(configPath),
  );
  if (parsed.errors.length) throw new Error('Invalid package compiler options');
  const program = ts.createProgram([entryPath], parsed.options);
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  const module = entry && checker.getSymbolAtLocation(entry);
  if (!module) throw new Error(`Missing public entry: ${entryPath}`);
  const surface = new Map<string, string[]>();
  for (const exported of checker.getExportsOfModule(module)) {
    let symbol = exported;
    while (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol);
    const type =
      symbol.flags & ts.SymbolFlags.Value &&
      !(symbol.flags & ts.SymbolFlags.Class)
        ? checker.getTypeOfSymbolAtLocation(
            symbol,
            symbol.valueDeclaration ?? entry!,
          )
        : checker.getDeclaredTypeOfSymbol(symbol);
    const reachableTypes: [string, ts.Type][] = [
      [exported.name, type],
      ...type.getCallSignatures().map(
        (signature): [string, ts.Type] => [
          `${exported.name}()`,
          checker.getReturnTypeOfSignature(signature),
        ],
      ),
    ];
    for (const [name, reachableType] of reachableTypes)
      surface.set(
        name,
        [
          ...(surface.get(name) ?? []),
          ...checker
            .getPropertiesOfType(reachableType)
            .filter(
              (member) =>
                !member.declarations?.some(
                  (declaration) =>
                    ts.getCombinedModifierFlags(declaration) &
                    (ts.ModifierFlags.Private | ts.ModifierFlags.Protected),
                ),
            )
            .map((member) => member.name),
        ],
      );
  }
  return surface;
}
