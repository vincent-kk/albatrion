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
 * @param preparedExpression - Optional substitution from the same source and dependency registry
 * @returns Literal evidence or undefined; never compiles or invokes authored code
 */
export const recognizeEqualityExpression = (
  source: string,
  dependencies: readonly string[],
  preparedExpression?: string,
): BlueprintExpression['equality'] => {
  if (dependencies.length !== 1) return;
  let substituted = preparedExpression;
  if (substituted === undefined) {
    const manager = getPathManager();
    substituted = substituteDependencyPaths(manager, source);
    const paths = manager.get();
    let hasUnsupportedDependencies =
      paths.length !== 1 || paths.length !== dependencies.length;
    if (!hasUnsupportedDependencies) {
      for (let index = 0, count = paths.length; index < count; index++) {
        const path = paths[index];

        if (path !== dependencies[index]) {
          hasUnsupportedDependencies = true;
          break;
        }
      }
    }
    if (hasUnsupportedDependencies) {
      return;
    }
  }
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
