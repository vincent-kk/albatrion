import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';

/** Resolved syntax only; emitted values and effective schemas remain call-local. */
interface StateDependencyPlan {
  /** Absolute dependency address, including the context sentinel. */
  readonly path: string;
  /** Decoded names and operators reused by emitted-value traversal. */
  readonly segments: readonly PointerSegment[];
}

/** One actual host's authored dependencies under its current address witness. */
interface StateDependencyPlans {
  /** Address used to bind every retained relative dependency. */
  readonly hostPath: string;
  /** Separate syntax for each authored dependency at this occurrence. */
  readonly dependencies: Map<string, StateDependencyPlan>;
}

/**
 * Prepare authored dependency syntax without retaining a live lookup result.
 * @param runtime - Tree runtime owning bounded concrete pointer syntax
 * @param hostPath - Current absolute address anchoring relative dependencies
 * @param dependency - Authored pointer or context token
 * @param owner - Actual host identity; cold direct callers may use the runtime
 * @returns The retained syntax plan, rebound when the host address changes
 */
export const getStateDependencyPlan = (
  runtime: object,
  hostPath: string,
  dependency: string,
  owner: object = runtime,
): StateDependencyPlan => {
  const derived = getHostDerived<'stateDependencyPlans', StateDependencyPlans>(
    owner,
  );
  let plans = derived.stateDependencyPlans;
  if (!plans || plans.hostPath !== hostPath)
    derived.stateDependencyPlans = plans = {
      hostPath,
      dependencies: new Map(),
    };
  let plan = plans.dependencies.get(dependency);
  if (!plan) {
    const path = resolveDependencyPath(hostPath, dependency);
    plan = { path, segments: getCachedPointerSegments(runtime, path) };
    plans.dependencies.set(dependency, plan);
  }
  return plan;
};
