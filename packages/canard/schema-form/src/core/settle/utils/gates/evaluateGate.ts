import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR,
  SchemaFormError, VALIDATOR_MISSING } from '../../../../errors';
import { isArray } from '@winglet/common-utils/filter';
import { unescapeSegment } from '@winglet/json/pointer';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { BlueprintGate } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { readProjectedValue } from './readProjectedValue';
import { EXPRESSION_THREW, GUARD_FAILED } from '../errors/settleErrorCode';
import { getGateRegistry } from './getGateRegistry';
import { getGateExpression } from './getGateExpression';
import { readSchemaNodeGuard } from '../../../validation';
import { ValidationMode } from '../../../types/state';

/**
 * Evaluate one bound gate with the real expression or validator guard.
 * @param gate - Declarative condition bound to the current occurrence
 * @param context - Projected tree and deferred gate failure collection to update
 * @param owner - Live occurrence whose template contains this gate
 * @param edgeName - Direct child whose own active gate is being evaluated
 * @returns Whether the condition currently admits its declaration
 */
export const evaluateGate = <Self extends SchemaNodeRecord<Self>>(
  gate: BlueprintGate,
  context: SettlementContext<Self>,
  owner: Self,
  edgeName?: string,
): boolean => {
  if (gate.appliesWhen?.some((parentGate) =>
    !evaluateGate(parentGate, context, owner)))
    return false;
  const hostPath = getGateRegistry(owner.runtime).locate(owner, gate, edgeName).hostPath;
  const raw = gate.kind === 'active' ? undefined : readProjectedValue(context, hostPath);
  const host = raw !== null && typeof raw === 'object' && !isArray(raw)
    ? raw : {};
  let input: Record<string, unknown> = { ...host };
  const hostNode = gate.kind === 'active' ? undefined : hostPath === '' ? context.root :
    hostPath.split('/').slice(1).reduce<Self | undefined>((node, encoded) => {
      const structure = node?.structure;
      const name = unescapeSegment(encoded);
      return structure && hasOwnProperty(structure, name)
        ? structure[name] : undefined;
    }, context.root);
  const extra = hostNode?.extras;
  let projectedHost = hostNode !== undefined;
  for (let ancestor: Self | null | undefined = hostNode;
    ancestor; ancestor = ancestor.parent)
    if (ancestor.behavior.strategy === 'branch' && ancestor.raw !== undefined &&
      (ancestor.parent !== null || raw === null || typeof raw !== 'object' ||
        isArray(raw))) {
      projectedHost = false;
      break;
    }
  const projectedExtra = projectedHost ? extra : undefined;
  if (projectedExtra !== null && typeof projectedExtra === 'object' &&
    !isArray(projectedExtra))
    input = { ...input, ...projectedExtra };
  try {
    if (gate.kind === 'discriminator') {
      const condition = gate.condition;
      if (condition === null || typeof condition !== 'object' ||
        !('propertyName' in condition) ||
        typeof condition.propertyName !== 'string' ||
        !('values' in condition) || !isArray(condition.values)) return false;
      const value = hasOwnProperty(input, condition.propertyName)
        ? input[condition.propertyName] : undefined;
      return condition.values.some((candidate: unknown) => Object.is(candidate, value));
    }
    if (gate.kind === 'if') {
      const runtime = context.root.runtime;
      const guard = readSchemaNodeGuard(runtime, gate);
      if (!guard) {
        const keys = runtime.errorReporter?.hasConsumer()
          ? runtime.warningKeys ??= new Set() : undefined;
        if (runtime.validationMode !== ValidationMode.None &&
          keys && !keys.has(VALIDATOR_MISSING)) {
          keys.add(VALIDATOR_MISSING);
          const record = { level: 'warning' as const,
            code: `SCHEMA_FORM_WARNING.${VALIDATOR_MISSING}` as const,
            message: 'Validation is disabled because no validator was selected' };
          (runtime.pendingWarningRecords ??= new Map()).set(VALIDATOR_MISSING,
            record);
          runtime.chainOccurrences?.push({ kind: 'record', record });
        }
        if (keys && !keys.has(CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR)) {
          keys.add(CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR);
          const record = { level: 'warning' as const,
            code: `SCHEMA_FORM_WARNING.${CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR}` as const,
            message: 'Conditional schema is inactive without a validator',
            schemaPath: gate.schemaPath };
          (runtime.pendingWarningRecords ??= new Map()).set(
            CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR, record);
          runtime.chainOccurrences?.push({ kind: 'record', record });
        }
        return false;
      }
      const result: unknown = guard(input);
      if (typeof result !== 'boolean')
        throw new TypeError(`Guard at ${gate.schemaPath} did not return a boolean`);
      return gate.negated ? !result : result;
    }
    const blueprint = context.root.runtime.blueprint;
    const expression = blueprint ? getGateExpression(blueprint, gate.schemaPath) :
      undefined;
    if (expression) {
      const dependencies = expression.dependencies.map((dependency) => {
        const path = resolveDependencyPath(hostPath, dependency);
        return path === '@' ? context.root.runtime.context ?? {} :
          readProjectedValue(context, path);
      });
      return Boolean(expression.evaluate(dependencies));
    }
    return gate.condition === true;
  } catch (cause) {
    const runtime = context.root.runtime;
    context.gateThrowVersion = (context.gateThrowVersion ?? 0) + 1;
    const code = gate.kind === 'if' ? GUARD_FAILED : EXPRESSION_THREW;
    const repeated = context.failures?.some((error) =>
      error.code === `SCHEMA_FORM_ERROR.${code}` &&
      error.details.path === hostPath && error.details.schemaPath === gate.schemaPath);
    const failure = runtime.mountingGuardPass || repeated ? undefined :
      new SchemaFormError(code, `Gate evaluation failed at ${gate.schemaPath}`,
        { path: hostPath, schemaPath: gate.schemaPath, cause });
    if (gate.kind === 'if' && runtime.errorReporter?.hasConsumer() &&
      !runtime.reportedGuardFailures?.has(gate.schemaPath) &&
      !runtime.guardFailureRecords?.has(gate.schemaPath))
      {
        const record = { level: 'error' as const,
          code: 'SCHEMA_FORM_ERROR.GUARD_FAILED' as const,
          message: `Gate evaluation failed at ${gate.schemaPath}`,
          schemaPath: gate.schemaPath, path: hostPath,
          details: { cause },
          surface: runtime.mountingGuardPass ? 'sink' as const : 'thrown' as const };
        (runtime.guardFailureRecords ??= new Map()).set(gate.schemaPath, record);
        runtime.chainOccurrences?.push({ kind: 'record', record });
      }
    if (failure) recordSettlementFailure(context, failure, 'expression');
    return false;
  }
};
