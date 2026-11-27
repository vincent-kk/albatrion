import type * as ts from 'typescript';

/** Extract the full JSDoc comment block preceding a node. */
export function extractJSDocComment(node: ts.Node, fullText: string): string | null {
  const nodeStart = node.getFullStart();
  const leadingText = fullText.substring(0, nodeStart + node.getLeadingTriviaWidth());

  // Find the last JSDoc block before this node
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = jsdocRegex.exec(leadingText)) !== null) {
    lastMatch = match;
  }

  if (!lastMatch) return null;

  // Verify the JSDoc block is close to the node (no other code between)
  const textBetween = leadingText.substring(lastMatch.index + lastMatch[0].length).trim();
  if (textBetween.length > 0) return null;

  return lastMatch[0];
}
