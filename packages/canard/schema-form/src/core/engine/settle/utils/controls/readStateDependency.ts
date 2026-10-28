import { hasOwnProperty } from '@winglet/common-utils/lib';

import { PointerOperator } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getStateDependencyPlan } from './getStateDependencyPlan';

/** Emission and context retained before a settlement changes the live tree. */
export interface EmissionSnapshot {
  /** Previously emitted root value. */
  readonly emit: unknown;
  /** Previously bound context object. */
  readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Read an authored state or watch path from the final emitted tree.
 * @param root - Live root whose output and context are settled
 * @param hostPath - Occurrence path that anchors relative dependencies
 * @param dependency - Authored pointer or context token
 * @param snapshot - Optional preceding commit when a node is detaching
 * @param owner - Actual host binding the syntax; defaults to the runtime for direct calls
 * @param absentContext - Existing same-node/commit empty context identity, when still selected
 * @returns The emitted value, context, or undefined for an absent path
 */
export const readStateDependency = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  hostPath: string,
  dependency: string,
  snapshot?: EmissionSnapshot,
  owner: object = root.runtime,
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
  let value: unknown = snapshot ? snapshot.emit : root.emit;
  for (const name of segments) {
    if (value === null || typeof value !== 'object') return undefined;
    if (typeof name !== 'string') return undefined;
    if (!hasOwnProperty(value, name)) return undefined;
    value = Reflect.get(value, name);
  }
  return value;
};
