import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  PointerOperator,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, BlueprintGate } from '../../../../blueprint';
import { engineModes } from '../../../../utils/cache/engineModes';
import { readFieldNodeGuard } from '../../../../validation';
import type { GatePredicate } from '../../../types/gatePredicate';
import { getGateExpression } from '../getGateExpression';
import type { GateOccurrence } from '../type';
import { getIfGateReadNames } from './getIfGateReadNames';

/**
 * Bind a reusable gate to its live occurrence without evaluating any condition.
 * @param runtime - Tree-owned immutable analysis and selected validator binding
 * @param occurrence - Bound host and gate whose reads have already been resolved
 * @param reads - Complete absolute value paths used by this occurrence
 * @returns Predicate with stable witness keys and one lazy validator binding
 */
export const createGatePredicate = (
  runtime: { blueprint: Blueprint; validator?: unknown },
  occurrence: GateOccurrence,
  reads: readonly string[],
): GatePredicate => {
  const gate: BlueprintGate = occurrence.gate;
  const expression =
    gate.kind === 'active'
      ? getGateExpression(runtime.blueprint, gate.schemaPath)
      : undefined;
  const names =
    gate.kind === 'if' && engineModes.gatePredicate !== 'off'
      ? getIfGateReadNames(gate.condition, runtime.blueprint)
      : undefined;
  let guard: ReturnType<typeof readFieldNodeGuard>;
  const inputs: GatePredicate['inputs'][number][] = [];
  const referenceDiscriminator =
    gate.kind === 'discriminator' && engineModes.gatePredicate === 'off';
  const inputReads = referenceDiscriminator ? [occurrence.hostPath] : reads;
  for (let index = 0; index < inputReads.length; index++) {
    const path = inputReads[index];
    const kind =
      readPointerSegment(path, 0) === PointerOperator.Context
        ? 'context'
        : names
          ? 'property'
          : 'value';
    inputs.push({
      path,
      kind,
      key: kind === 'value' ? path : kind + ':' + path,
      ...(names ? { hostPath: occurrence.hostPath, name: names[index] } : {}),
    });
    if (names)
      inputs.push({
        path,
        kind: 'presence',
        key: 'presence:' + path,
        hostPath: occurrence.hostPath,
        name: names[index],
      });
  }
  if ((gate.kind === 'if' && !names) || referenceDiscriminator)
    inputs.push({
      path: occurrence.hostPath,
      kind: 'extra',
      key: 'extra:' + occurrence.hostPath,
    });
  return {
    reads,
    names,
    inputs,
    arguments: { values: new Array<unknown>(inputs.length), view: undefined },
    memoizable:
      engineModes.gatePredicate !== 'off' &&
      (gate.kind !== 'active' ||
        (expression?.completeReads === true &&
          !(() => {
            const items = reads;
            for (let index = 0, count = items.length; index < count; index++) {
              if (!(index in items)) continue;
              const path = items[index];
              if (readPointerSegment(path, 0) === PointerOperator.Context)
                return true;
            }
            return false;
          })())),
    evaluate: (input) => {
      if (gate.kind === 'if') {
        guard ??= readFieldNodeGuard(runtime, gate);
        if (!guard) return undefined;
        const result: unknown = guard(input.view);
        if (typeof result !== 'boolean')
          throw new TypeError(
            `Guard at ${gate.schemaPath} did not return a boolean`,
          );
        return gate.negated ? !result : result;
      }
      if (gate.kind === 'discriminator') {
        const value =
          input.view && hasOwnProperty(input.view, gate.condition.propertyName)
            ? input.view[gate.condition.propertyName]
            : undefined;
        for (const tag of gate.condition.values) if (tag === value) return true;
        return false;
      }
      return expression
        ? Boolean(expression.evaluate(input.values))
        : gate.condition === true;
    },
  };
};
