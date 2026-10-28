import type { BlueprintNode,EffectiveSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import type { SettlementContext } from '../../types/settlement';
import { getRecursiveRelativeSpan } from './utils/getRecursiveRelativeSpan';


/** Only the cycle verdict outlives the one-time graph traversal. */

/**
 * Detect a back edge without mistaking shared DAG templates for recursion.
 * @param node - Template at the current DFS position
 * @param visiting - Templates on the active DFS stack
 * @param visited - Templates whose outgoing edges have been checked
 * @returns Whether a reachable template cycle exists
 */
const hasTemplateCycle = (
  node: BlueprintNode,
  visiting: Set<BlueprintNode>,
  visited: Set<BlueprintNode>,
): boolean => {
  if (visiting.has(node)) return true;
  if (visited.has(node)) return false;
  visiting.add(node);
  for (let index = 0; index < node.childEntries.length; index++)
    if (hasTemplateCycle(node.childEntries[index].node, visiting, visited))
      return true;
  for (const item of node.itemCandidates ?? (node.item ? [node.item] : []))
    if (hasTemplateCycle(item, visiting, visited)) return true;
  const prefixItems = node.prefixItems;
  for (let index = 0; prefixItems && index < prefixItems.length; index++)
    for (const item of node.prefixItemCandidates?.[index] ?? [
      prefixItems[index],
    ])
      if (hasTemplateCycle(item, visiting, visited)) return true;
  visiting.delete(node);
  visited.add(node);
  return false;
};

/**
 * Read caller or preserved sources while excluding this settlement's fills.
 * @param node - Occurrence whose own and descendant inputs can anchor a chain
 * @param context - Distribution provenance and automatic write membership
 * @returns Whether a caller-origin value exists at or below this occurrence
 */
const hasOriginalInput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const distribution = context.distributedInputs.get(node);
  if (
    distribution &&
    !distribution.automatic &&
    distribution.input !== undefined
  )
    return true;
  if (
    node.behavior.type === 'array' &&
    node.itemCount > 0 &&
    !distribution?.automatic &&
    !context.filledNodes.has(node)
  )
    return true;
  if (
    !context.filledNodes.has(node) &&
    (node.raw !== undefined || node.undeclaredValues !== undefined)
  )
    return true;
  const children = node.children;
  for (let index = 0; children && index < children.length; index++)
    if (hasOriginalInput(children[index], context)) return true;
  return false;
};

/**
 * Stop the same origin-less template chain in shape expansion and host fill.
 * @param parent - Current declaration host
 * @param template - Template requested by the gate
 * @param input - Present distributed or latent value for the requested occurrence
 * @param context - Settlement's live and latent source index
 * @param schema - Effective schema required to match for an automatic host fill
 * @param hosts - Automatically filled hosts, when checking a fill candidate
 * @returns Whether repeating the template would expand without a source
 */
export const hasRecursiveExpansion = <Self extends FieldNodeRecord<Self>>(
  parent: Self,
  template: BlueprintNode,
  input: unknown,
  context: SettlementContext<Self>,
  schema?: EffectiveSchema,
  hosts?: ReadonlySet<Self>,
): boolean => {
  if (input !== undefined) return false;
  const analysis = parent.runtime.blueprint;
  let cyclic = getBlueprintDerived<'recursiveExpansion', boolean>(
    analysis,
  ).recursiveExpansion;
  if (cyclic === undefined) {
    cyclic = hasTemplateCycle(analysis.root, new Set(), new Set());
    getBlueprintDerived<'recursiveExpansion', boolean>(
      analysis,
    ).recursiveExpansion = cyclic;
  }
  if (!cyclic) return false;
  let relativeSpan: number | undefined;
  const depth = parent.depth + 1;
  let ancestor: Self | null = parent;
  while (ancestor) {
    if (
      ancestor.blueprintNode === template &&
      (!schema || ancestor.schema === schema) &&
      (!hosts || hosts.has(ancestor)) &&
      !hasOriginalInput(ancestor, context)
    ) {
      relativeSpan ??= getRecursiveRelativeSpan(analysis);
      if (depth - ancestor.depth >= relativeSpan) return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
};
