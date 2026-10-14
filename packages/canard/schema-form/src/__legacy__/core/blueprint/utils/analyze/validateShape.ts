import type { BlueprintNode } from '../../type';
import type { AnalysisContext } from './type';
import { visitShape } from './validateShape/utils/visitShape';

/**
 * Reject cycles whose object-property edges force infinite eager shape.
 * @param context - Finite analyzed graph and error collector
 * @returns Nothing when every shape cycle contains a gate, array, or terminal cut
 */
export const validateShape = (context: AnalysisContext): void => {
  const complete = new Set<BlueprintNode>();
  const active = new Set<BlueprintNode>();
  for (const node of context.nodes) visitShape(context, node, complete, active);
};
