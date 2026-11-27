import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';

/** One actual host's authored dependencies under its current address witness; the record declares the shape. */
type StateDependencyPlans = NonNullable<
  FieldNodeRecord<unknown>['__stateDependencyPlans__']
>;

/** Resolved syntax only; emitted values and effective schemas remain call-local. */
type StateDependencyPlan = NonNullable<
  ReturnType<StateDependencyPlans['dependencies']['get']>
>;

/**
 * Prepare authored dependency syntax without retaining a live lookup result.
 * @param runtime - Tree runtime owning bounded concrete pointer syntax
 * @param hostPath - Current absolute address anchoring relative dependencies
 * @param dependency - Authored pointer or context token
 * @param owner - Actual host whose `__stateDependencyPlans__` retains the syntax
 * @returns The retained syntax plan, rebound when the host address changes
 */
export const getStateDependencyPlan = (
  runtime: object,
  hostPath: string,
  dependency: string,
  owner: Pick<FieldNodeRecord<unknown>, '__stateDependencyPlans__'>,
): StateDependencyPlan => {
  let plans = owner.__stateDependencyPlans__;
  if (!plans || plans.hostPath !== hostPath)
    owner.__stateDependencyPlans__ = plans = {
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
