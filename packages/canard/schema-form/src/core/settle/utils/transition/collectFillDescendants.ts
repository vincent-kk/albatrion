import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Continue one parent-first fill traversal through nodes produced by host writes.
 * @param context - Settlement whose appearance set appends parents before children
 * @param appearances - Cursor immediately after the previously visited appearances
 * @param count - Number of newly appended occurrences to consume
 * @param ancestors - Existing hosts' pre-fill item counts; -1 marks a newly produced branch
 * @param newArrayHosts - Arrays whose current fill first introduced item gate slots
 * @returns Depth buckets for the same round, or undefined when only gates produced nodes
 */
export const collectFillDescendants = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, appearances: Iterator<Self>, count: number,
  ancestors: Map<Self, number>,
  newArrayHosts?: ReadonlySet<Self>,
): Self[][] | undefined => {
  let byDepth: Self[][] | undefined;
  const firstEvaluations = context.hasGates ? new Set<Self>() : undefined;
  for (let index = 0; index < count; index++) {
    const node = appearances.next().value!;
    if (node.detached || !node.parent) continue;
    const parentOrigin = ancestors.get(node.parent);
    if (parentOrigin === undefined &&
      !context.distributedInputs.get(node.parent)?.automatic) continue;
    const newItem = node.parent.behavior.type === 'array' &&
      newArrayHosts?.has(node.parent) &&
      parentOrigin !== undefined && parentOrigin >= 0 && Number(node.name) >= parentOrigin;
    const firstEvaluation = parentOrigin === -1 && firstEvaluations?.has(node.parent);
    if (context.hasGates && !firstEvaluation && !newItem) {
      const declarations = node.blueprintNode.declarations;
      let ungated = false;
      for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++)
        if (declarations[declarationIndex].role === 'declaration' &&
          declarations[declarationIndex].gates.length === 0) { ungated = true; break; }
      if (!ungated) continue;
    }
    if (node.behavior.strategy === 'branch') {
      ancestors.set(node, -1);
      firstEvaluations?.add(node);
    }
    byDepth ??= [];
    (byDepth[node.depth] ??= []).push(node);
  }
  return byDepth;
};
