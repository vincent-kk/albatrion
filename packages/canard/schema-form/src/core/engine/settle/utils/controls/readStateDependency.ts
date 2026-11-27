import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Optional } from '@aileron/declare';

import { PointerOperator } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getStateDependencyPlan } from './getStateDependencyPlan';

/** Output value and context retained before a settlement changes the live tree. */
export interface OutputValueSnapshot {
  /** Previously emitted root value. */
  readonly outputValue: unknown;
  /** Previously bound context object. */
  readonly context?: Readonly<Dictionary<unknown>>;
}

/**
 * Read an authored state or watch path from the final emitted tree.
 * @param root - Live root whose output and context are settled
 * @param hostPath - Occurrence path that anchors relative dependencies
 * @param dependency - Authored pointer or context token
 * @param snapshot - Preceding commit when a node is detaching, otherwise undefined
 * @param owner - Actual host whose `__stateDependencyPlans__` binds the syntax
 * @param absentContext - Existing same-node/commit empty context identity, when still selected
 * @returns The emitted value, context, or undefined for an absent path
 */
export const readStateDependency = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  hostPath: string,
  dependency: string,
  snapshot: Optional<OutputValueSnapshot>,
  owner: Pick<FieldNodeRecord<unknown>, '__stateDependencyPlans__'>,
  absentContext?: object,
): unknown => {
  const { segments } = getStateDependencyPlan(
    root.runtime,
    hostPath,
    dependency,
    owner,
  );
  if (segments[0] === PointerOperator.Context)
    return (
      (snapshot ? snapshot.context : root.runtime.context) ??
      absentContext ??
      {}
    );
  let value: unknown = snapshot ? snapshot.outputValue : root.__outputValue__;
  for (const name of segments) {
    if (value === null || typeof value !== 'object') return undefined;
    if (typeof name !== 'string') return undefined;
    if (!hasOwnProperty(value, name)) return undefined;
    value = Reflect.get(value, name);
  }
  return value;
};
