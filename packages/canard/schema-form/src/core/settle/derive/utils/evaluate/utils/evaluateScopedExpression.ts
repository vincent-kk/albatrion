import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveRule } from '../../../type';
import { readDeriveDependency } from './readDeriveDependency';

/** One evaluation shared by every target of a host-scoped control item. */
export interface ScopedExpressionResult {
  /** Expression result, including undefined when that was returned. */
  readonly value: unknown;
  /** Whether the authored expression threw. */
  readonly threw: boolean;
  /** Original thrown value retained for the settlement error. */
  readonly cause?: unknown;
}

/**
 * Evaluate one authored expression once per host and completed round.
 * @param root - Current emitted tree for dependency values
 * @param host - Occurrence anchoring relative expression paths
 * @param rule - Authored rule shared by its addressed targets
 * @param cache - Results already evaluated in this round
 * @returns The shared result or thrown cause
 */
export const evaluateScopedExpression = <Self extends SchemaNodeRecord<Self>>(
  root: Self, host: Self, rule: DeriveRule,
  cache: Map<string, ScopedExpressionResult>,
): ScopedExpressionResult => {
  if (!rule.expression) return { value: rule.literal, threw: false };
  const key = JSON.stringify([host.path, rule.schemaPath]);
  const cached = cache.get(key);
  if (cached) return cached;
  let result: ScopedExpressionResult;
  try {
    result = { value: rule.expression.evaluate(rule.expression.dependencies.map(
      (dependency) => readDeriveDependency(root, host.path, dependency))),
      threw: false };
  } catch (cause) {
    result = { value: undefined, threw: true, cause };
  }
  cache.set(key, result);
  return result;
};
