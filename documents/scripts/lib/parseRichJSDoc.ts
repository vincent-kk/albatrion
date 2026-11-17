import * as fs from 'node:fs';
import * as ts from 'typescript';

import { extractDeclarationInfo } from './parseRichJSDoc/extractDeclarationInfo';
import type { ParsedFunction } from './types';

/**
 * Parse a .d.ts file and extract rich JSDoc information for each exported declaration.
 */
export function parseRichJSDoc(
  dtsPath: string,
  packageName: string,
  packageVersion: string,
  categoryPath: string,
): ParsedFunction[] {
  const content = fs.readFileSync(dtsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    dtsPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const resultMap = new Map<string, ParsedFunction>();

  ts.forEachChild(sourceFile, (node) => {
    if (!isExportedDeclaration(node)) return;

    const info = extractDeclarationInfo(node, sourceFile, content);
    if (!info) return;

    const entry: ParsedFunction = {
      ...info,
      packageName,
      packageVersion,
      categoryPath,
      sourceFile: dtsPath,
      importPaths: [],
      externalSource: null,
    };

    // Deduplicate by name: prefer the entry with richer JSDoc
    const existing = resultMap.get(info.name);
    if (!existing || info.description.length > existing.description.length) {
      resultMap.set(info.name, entry);
    }
  });

  return Array.from(resultMap.values());
}

/** Check if a node is an exported declaration. */
function isExportedDeclaration(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!modifiers) return false;
  return modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
}
