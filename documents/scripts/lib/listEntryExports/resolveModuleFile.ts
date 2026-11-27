import * as ts from 'typescript';

/** The source file a module specifier resolves to; undefined when it does not resolve to a file. */
export function resolveModuleFile(checker: ts.TypeChecker, specifier: ts.StringLiteral): ts.SourceFile | undefined {
  return checker.getSymbolAtLocation(specifier)?.declarations?.find(ts.isSourceFile);
}
