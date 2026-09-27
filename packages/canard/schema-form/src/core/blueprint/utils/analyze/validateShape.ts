import type { BlueprintNode } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import type { AnalysisContext } from './type';

/**
 * Reject cycles whose object-property edges force infinite eager shape.
 * @param context - Finite analyzed graph and error collector
 * @returns Nothing when every shape cycle contains a gate, array, or terminal cut
 */
export const validateShape = (context: AnalysisContext): void => {
  const complete = new Set<BlueprintNode>();
  const active = new Set<BlueprintNode>();
  const visit = (node: BlueprintNode): void => {
    if (
      node.strategy === 'terminal' ||
      node.kind === 'array' ||
      complete.has(node)
    )
      return;
    if (active.has(node))
      throwBlueprintError(
        BlueprintErrorCode.RecursiveShapeUnbounded,
        node.schemaPath,
        { path: node.path },
        context.options,
      );
    active.add(node);
    for (const edge of node.childEntries)
      if (
        edge.declarations.some(
          (declaration) =>
            declaration.role === 'declaration' && !declaration.gates.length,
        )
      )
        visit(edge.node);
    active.delete(node);
    complete.add(node);
  };
  for (const node of context.nodes) visit(node);
};
