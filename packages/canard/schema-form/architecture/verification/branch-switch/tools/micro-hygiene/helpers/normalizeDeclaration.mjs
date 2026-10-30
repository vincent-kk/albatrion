import ts from 'typescript';

import { normalizeDeclarationNode } from './normalizeDeclarationNode.mjs';

/** Proven synonyms from the canonical aileron utility declarations. */
const utilities = ['Dictionary', 'Nullable', 'Optional', 'Nullish'];

/** Expand only proven utility aliases for declaration equivalence.
 * @param {string} source Complete declaration bytes, including their type imports.
 * @param {string} file Stable logical file name for the TypeScript parser.
 * @returns {string} Canonical declaration AST with modifiers and signatures preserved.
 */
export function normalizeDeclaration(source, file) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const names = {};
  for (const s of sf.statements)
    if (
      ts.isImportDeclaration(s) &&
      s.moduleSpecifier.text.includes('@aileron/declare') &&
      s.importClause?.namedBindings &&
      ts.isNamedImports(s.importClause.namedBindings)
    )
      for (const e of s.importClause.namedBindings.elements) {
        const original = e.propertyName?.text ?? e.name.text;
        if (utilities.includes(original)) names[e.name.text] = original;
      }
  const transform = (context) => (root) =>
    ts.visitNode(root, (node) =>
      normalizeDeclarationNode(node, context, names, sf),
    );
  const transformed = ts.transform(sf, [transform]).transformed[0];
  const printer = ts.createPrinter({ removeComments: true });
  const imports = transformed.statements
    .filter(ts.isImportDeclaration)
    .map((s) => printer.printNode(ts.EmitHint.Unspecified, s, sf))
    .sort();
  const rest = transformed.statements
    .filter((s) => !ts.isImportDeclaration(s))
    .map((s) => printer.printNode(ts.EmitHint.Unspecified, s, sf));
  return imports.concat(rest).join('\n');
}
