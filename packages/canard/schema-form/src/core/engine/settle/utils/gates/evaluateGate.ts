import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  FormErrorCode,
  FormWarningCode,
  SchemaFormError,
} from '../../../../../errors';
import type { BlueprintGate } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import type { SettlementContext } from '../../types/settlement';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { getGateRegistry } from './getGateRegistry';
import { readGateHostView } from './readGateHostView';
import { readProjectedValue } from './readProjectedValue';
import { recordGateInput } from './recordGateInput';

/**
 * Evaluate one bound gate with the real expression or validator guard.
 * This helper stays here because it recurses through the exported wrapper; a separate file would create an import cycle.
 * @param gate - Declarative condition bound to the current occurrence
 * @param context - Projected tree and deferred gate failure collection to update
 * @param owner - Live occurrence whose template contains this gate
 * @param edgeName - Direct child whose own active gate is being evaluated
 * @returns Whether the condition currently admits its declaration
 */
const evaluateGateValue = <Self extends FieldNodeRecord<Self>>(
  gate: BlueprintGate,
  context: SettlementContext<Self>,
  owner: Self,
  edgeName?: string,
  reference = false,
): boolean => {
  if (
    gate.appliesWhen?.some(
      (parentGate) =>
        !evaluateGate(parentGate, context, owner, undefined, reference),
    )
  )
    return false;
  const registry = getGateRegistry(owner.runtime);
  const occurrence = registry.locate(owner, gate, edgeName);
  const hostPath = occurrence.hostPath;
  const predicate = occurrence.predicate;
  const reusable = !reference && !!context.kind && predicate.memoizable;
  const input = reusable ? predicate.arguments : undefined;
  try {
    const view =
      gate.kind === 'active'
        ? undefined
        : readGateHostView(context, hostPath, owner);
    const dependencies =
      input?.values ?? new Array<unknown>(predicate.inputs.length);
    const memo = occurrence.memo;
    let identical = !!memo && memo.values.length === predicate.inputs.length;
    for (let index = 0; index < predicate.inputs.length; index++) {
      const site = predicate.inputs[index];
      const value =
        site.kind === 'context'
          ? context.root.runtime.context
          : site.kind === 'extra'
            ? view?.extra
            : site.kind === 'property'
              ? view?.value[site.name!]
              : site.kind === 'presence'
                ? hasOwnProperty(view!.value, site.name!)
                : gate.kind === 'if' ||
                    (gate.kind === 'discriminator' && site.path === hostPath)
                  ? view?.projected
                  : gate.kind === 'discriminator'
                    ? hasOwnProperty(view!.value, gate.condition.propertyName)
                      ? view!.value[gate.condition.propertyName]
                      : undefined
                    : readProjectedValue(context, site.path);
      if (identical && !Object.is(memo!.values[index], value))
        identical = false;
      dependencies[index] = value;
      recordGateInput(context, site.path, value, site.kind, site);
    }
    if (
      gate.kind === 'active' &&
      occurrence.evaluationHostPath !== occurrence.hostPath
    )
      (context.relocatedReads ??= new Map()).set(occurrence, {
        paths: occurrence.watchPaths,
        values: dependencies,
      });
    if (reusable && identical && memo) return memo.value;
    if (!reference) occurrence.memo = undefined;
    const args = input ?? { values: dependencies, view: undefined };
    args.view = view?.value;
    const result = predicate.evaluate(args);
    if (result === undefined && gate.kind === 'if') {
      const runtime = context.root.runtime;
      const keys = runtime.errorReporter?.hasConsumer()
        ? (runtime.warningKeys ??= new Set())
        : undefined;
      if (
        runtime.validationMode !== ValidationMode.None &&
        keys &&
        !keys.has(FormWarningCode.ValidatorMissing)
      ) {
        keys.add(FormWarningCode.ValidatorMissing);
        const record = {
          level: 'warning' as const,
          code: FormWarningCode.ValidatorMissing,
          message: 'Validation is disabled because no validator was selected',
        };
        (runtime.pendingWarningRecords ??= new Map()).set(
          FormWarningCode.ValidatorMissing,
          record,
        );
        runtime.chainOccurrences?.push({ kind: 'record', record });
      }
      if (
        keys &&
        !keys.has(FormWarningCode.ConditionalSchemaWithoutValidator)
      ) {
        keys.add(FormWarningCode.ConditionalSchemaWithoutValidator);
        const record = {
          level: 'warning' as const,
          code: FormWarningCode.ConditionalSchemaWithoutValidator,
          message: 'Conditional schema is inactive without a validator',
          schemaPath: gate.schemaPath,
        };
        (runtime.pendingWarningRecords ??= new Map()).set(
          FormWarningCode.ConditionalSchemaWithoutValidator,
          record,
        );
        runtime.chainOccurrences?.push({ kind: 'record', record });
      }
      return false;
    }
    const value = result ?? false;
    if (
      !reference &&
      context.kind &&
      predicate.memoizable &&
      result !== undefined
    )
      if (memo) {
        memo.value = value;
        occurrence.memo = memo;
      } else occurrence.memo = { values: dependencies, value };
    return value;
  } catch (cause) {
    if (!reference) occurrence.memo = undefined;
    const runtime = context.root.runtime;
    context.gateThrowVersion = (context.gateThrowVersion ?? 0) + 1;
    const code =
      gate.kind === 'if'
        ? FormErrorCode.GuardFailed
        : FormErrorCode.ExpressionThrew;
    const repeated = context.failures?.some(
      (error) =>
        error.code === code &&
        error.details.path === hostPath &&
        error.details.schemaPath === gate.schemaPath,
    );
    const failure =
      runtime.mountingGuardPass || repeated
        ? undefined
        : new SchemaFormError(
            code,
            `Gate evaluation failed at ${gate.schemaPath}`,
            { path: hostPath, schemaPath: gate.schemaPath, cause },
          );
    if (
      gate.kind === 'if' &&
      runtime.errorReporter?.hasConsumer() &&
      !runtime.reportedGuardFailures?.has(gate.schemaPath) &&
      !runtime.guardFailureRecords?.has(gate.schemaPath)
    ) {
      const record = {
        level: 'error' as const,
        code: FormErrorCode.GuardFailed,
        message: 'Gate evaluation failed at ' + gate.schemaPath,
        schemaPath: gate.schemaPath,
        path: hostPath,
        details: { cause },
        surface: runtime.mountingGuardPass
          ? ('sink' as const)
          : ('thrown' as const),
      };
      (runtime.guardFailureRecords ??= new Map()).set(gate.schemaPath, record);
      runtime.chainOccurrences?.push({ kind: 'record', record });
    }
    if (failure) recordSettlementFailure(context, failure, 'expression');
    return false;
  } finally {
    if (input) {
      input.view = undefined;
      if (!occurrence.memo) input.values.fill(undefined);
    }
  }
};

/**
 * Evaluate a bound predicate, reusing only identical successful pure inputs.
 * @param gate - Bound condition, including recursive appliesWhen prerequisites
 * @param context - Current settlement and isolated host-wheel frame
 * @param owner - Live occurrence defining the condition
 * @param edgeName - Optional direct child selected by a node gate
 * @returns Current condition result without changing authored evaluation order
 */
export const evaluateGate = <Self extends FieldNodeRecord<Self>>(
  gate: BlueprintGate,
  context: SettlementContext<Self>,
  owner: Self,
  edgeName?: string,
  reference = false,
): boolean => {
  const version = context.gateThrowVersion;
  const value = evaluateGateValue(gate, context, owner, edgeName, reference);
  const frame = context.gateWheelFrame;
  if (
    !reference &&
    frame &&
    context.gateSelectionRounds?.get(owner)?.active &&
    version === context.gateThrowVersion
  ) {
    const occurrence = getGateRegistry(owner.runtime).locate(
      owner,
      gate,
      edgeName,
    );
    if (occurrence.predicate.memoizable)
      (frame.predicateResults ??= new Map()).set(occurrence, value);
  }
  context.gateWheelFrame?.evaluations?.push({
    gate,
    path: owner.path,
    edgeName,
    value,
  });
  return value;
};
