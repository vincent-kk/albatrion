import type {
  BlueprintExpression,
  EqualityLiteral,
} from '../../types/blueprint';
import { substituteDependencyPaths } from '../createDynamicFunction';
import { getPathManager } from '../getPathManager';
import { parseEqualityTree } from './utils/parseEqualityTree';
import { scanEqualityTokens } from './utils/scanEqualityTokens';

/**
 * Prove a complete OR of strict reference/literal comparisons without execution.
 * @param source - Authored active expression; blocks and unsupported syntax are refused
 * @param dependencies - Compiler's ordered list, which must match fresh substitution
 * @returns Literal evidence or undefined; never compiles or invokes authored code
 */
export const recognizeEqualityExpression = (
  source: string,
  dependencies: readonly string[],
): BlueprintExpression['equality'] => {
  const manager = getPathManager();
  const substituted = substituteDependencyPaths(manager, source);
  const paths = manager.get();
  if (
    paths.length !== 1 ||
    paths.length !== dependencies.length ||
    paths.some((path, index) => path !== dependencies[index])
  )
    return;
  const tokens = scanEqualityTokens(substituted);
  if (!tokens) return;
  const tree = parseEqualityTree(tokens);
  if (!tree) return;
  const pending = [tree];
  const literals: EqualityLiteral[] = [];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.kind === '||') {
      pending.push(node.right, node.left);
    } else if (node.kind === '===') {
      if (node.left.kind === 'reference' && node.right.kind === 'literal')
        literals.push(node.right.value);
      else if (node.right.kind === 'reference' && node.left.kind === 'literal')
        literals.push(node.left.value);
      else return;
    } else return;
  }
  return { literals };
};
