import { FormErrorCode } from '../../../../../errors';
import type { AnalysisContext } from '../../types/analysis';
import type { BlueprintNode } from '../../types/node';
import { throwBlueprintError } from '../../utils/diagnostics/throwBlueprintError';

/**
 * Traverse eager object edges and reject a node repeated in the active shape.
 * @param context - Analyzed graph options used to report a cycle
 * @param node - Current shape node
 * @param complete - Traversal-owned set of fully checked nodes
 * @param active - Traversal-owned set of nodes on the current eager path
 * @returns Nothing; updates traversal sets or throws for an unbounded cycle
 */
export const visitShape = (
  context: AnalysisContext,
  node: BlueprintNode,
  complete: Set<BlueprintNode>,
  active: Set<BlueprintNode>,
): void => {
  if (
    node.strategy === 'terminal' ||
    node.kind === 'array' ||
    complete.has(node)
  )
    return;
  if (active.has(node))
    throwBlueprintError(
      FormErrorCode.RecursiveShapeUnbounded,
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
      visitShape(context, edge.node, complete, active);
  active.delete(node);
  complete.add(node);
};
