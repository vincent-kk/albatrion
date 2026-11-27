import type * as ts from 'typescript';

import { extractJSDocComment } from '../extractJSDocComment';
import { type JSDocFields, parseJSDocFields } from '../parseJSDocFields';
import type { ParsedFunction } from '../types';
import { extractTypeSignature } from './extractTypeSignature';
import { getDeclarationKind } from './getDeclarationKind';
import { getDeclarationName } from './getDeclarationName';

/** Extract declaration info including JSDoc from a node. */
export function extractDeclarationInfo(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  fullText: string,
): Pick<ParsedFunction, 'name' | 'kind' | 'typeSignature'> & JSDocFields | null {
  const name = getDeclarationName(node);
  if (!name) return null;

  return {
    name,
    kind: getDeclarationKind(node),
    typeSignature: extractTypeSignature(node, sourceFile, fullText),
    ...parseJSDocFields(extractJSDocComment(node, fullText)),
  };
}
