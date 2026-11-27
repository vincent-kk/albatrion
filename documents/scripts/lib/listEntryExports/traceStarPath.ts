import * as ts from 'typescript';

import { resolveModuleFile } from './resolveModuleFile';
import type { StarEdge } from './types';

/**
 * Shortest chain of `export *` statements leading from `fromFile` to
 * `targetFile`, or null when none does. A target module that cannot be
 * resolved contributes no names, so it is never part of a chain.
 */
export function traceStarPath(checker: ts.TypeChecker, fromFile: ts.SourceFile, targetFile: ts.SourceFile): StarEdge[] | null {
  const queue: Array<{ file: ts.SourceFile; edges: StarEdge[] }> = [{ file: fromFile, edges: [] }];
  const visited = new Set<ts.SourceFile>([fromFile]);
  for (let index = 0; index < queue.length; index++) {
    const { file, edges } = queue[index];
    for (const statement of file.statements) {
      if (!ts.isExportDeclaration(statement) || statement.exportClause) continue;
      const specifier = statement.moduleSpecifier;
      if (!specifier || !ts.isStringLiteral(specifier)) continue;
      const target = resolveModuleFile(checker, specifier);
      if (!target || visited.has(target)) continue;
      const path = [
        ...edges,
        { fromFile: file.fileName, toFile: target.fileName, specifier: specifier.text, isTypeOnly: statement.isTypeOnly },
      ];
      if (target === targetFile) return path;
      visited.add(target);
      queue.push({ file: target, edges: path });
    }
  }
  return null;
}
