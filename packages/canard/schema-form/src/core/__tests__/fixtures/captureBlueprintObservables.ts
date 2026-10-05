import type { Blueprint } from '../../blueprint';

/**
 * Capture finite authored structure while excluding optimization capabilities.
 * @param analysis - Completed immutable blueprint, including recursive templates
 * @returns Comparable declarations, fragments, edges, expressions and dependencies
 */
export const captureBlueprintObservables = (analysis: Blueprint) => ({
  nodes: analysis.nodes.map(node => ({ ...node,
    childEntries: node.childEntries.map(entry => ({ ...entry, node: entry.node.id })),
    item: node.item?.id, prefixItems: node.prefixItems?.map(item => item.id),
  })),
  fragments: analysis.fragments,
  dependencies: analysis.dependencies,
  expressions: analysis.expressions.map(expression => ({ ...expression,
    evaluate: expression.evaluate.toString() })),
});
