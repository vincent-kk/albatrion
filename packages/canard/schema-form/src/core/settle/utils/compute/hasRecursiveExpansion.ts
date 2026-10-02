import type { Blueprint, BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasLatentUnder } from '../latent/hasLatentUnder';
import { isMissingRaw } from '../transition/isMissingRaw';

/** Only the cycle verdict outlives the one-time graph traversal. */
const CYCLIC_BLUEPRINTS = new WeakMap<Blueprint, boolean>();

/**
 * Detect a back edge without mistaking shared DAG templates for recursion.
 * @param node - Template at the current DFS position
 * @param visiting - Templates on the active DFS stack
 * @param visited - Templates whose outgoing edges have been checked
 * @returns Whether a reachable template cycle exists
 */
const hasTemplateCycle = (
  node: BlueprintNode, visiting: Set<BlueprintNode>, visited: Set<BlueprintNode>,
): boolean => {
  if (visiting.has(node)) return true;
  if (visited.has(node)) return false;
  visiting.add(node);
  for (const entry of node.childEntries)
    if (hasTemplateCycle(entry.node, visiting, visited)) return true;
  if (node.item && hasTemplateCycle(node.item, visiting, visited)) return true;
  for (const item of node.prefixItems ?? [])
    if (hasTemplateCycle(item, visiting, visited)) return true;
  visiting.delete(node);
  visited.add(node);
  return false;
};

/**
 * Stop source-free template repetition within object-property chains.
 * Array item edges terminate the chain because only existing items expand.
 * @param parent - Current declaration host
 * @param template - Template requested by the gate
 * @param input - Distributed or latent source for the new occurrence
 * @param context - Settlement's live and latent source index
 * @returns Whether repeating the template would expand without a source
 */
export const hasRecursiveExpansion = <Self extends SchemaNodeRecord<Self>>(
  parent: Self, template: BlueprintNode, input: unknown,
  context: SettlementContext<Self>,
): boolean => {
  if (input !== undefined) return false;
  const analysis = parent.runtime.blueprint;
  let cyclic = CYCLIC_BLUEPRINTS.get(analysis);
  if (cyclic === undefined) {
    cyclic = hasTemplateCycle(analysis.root, new Set(), new Set());
    CYCLIC_BLUEPRINTS.set(analysis, cyclic);
  }
  if (!cyclic) return false;
  let ancestor: Self | null = parent;
  while (ancestor) {
    if (ancestor.behavior.type === 'array') return false;
    if (ancestor.blueprintNode === template) {
      const hasSource = ancestor.raw !== undefined ||
        ancestor.extras !== undefined ||
        context.distributedInputs.get(ancestor)?.input !== undefined ||
        hasLatentUnder(context, ancestor.path) ||
        (ancestor.children ?? []).some((child) => !isMissingRaw(child, context));
      if (!hasSource) return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
};
