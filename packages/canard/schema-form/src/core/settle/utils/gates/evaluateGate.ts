import { SchemaFormError } from '../../../../errors';
import { unescapeSegment } from '@winglet/json/pointer';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { BlueprintGate } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { readProjectedValue } from './readProjectedValue';
import { EXPRESSION_THREW, GUARD_FAILED } from '../errors/settleErrorCode';
import { getGateRegistry } from './getGateRegistry';

/**
 * Evaluate one bound gate with the real expression or injected if predicate.
 * @param gate - Declarative condition bound to the current occurrence
 * @param context - Current projected tree and deferred failure slot
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
  const raw = readProjectedValue(context, hostPath);
  const host = raw !== null && typeof raw === 'object' && !Array.isArray(raw)
    ? raw : {};
  let input: Record<string, unknown> = { ...host };
  const hostNode = hostPath === '' ? context.root :
    hostPath.split('/').slice(1).reduce<Self | undefined>((node, encoded) => {
      const structure = node?.structure;
      const name = unescapeSegment(encoded);
      return structure && hasOwnProperty(structure, name)
        ? structure[name] : undefined;
    }, context.root);
  const extra = hostNode?.extras;
  if (extra !== null && typeof extra === 'object' && !Array.isArray(extra))
    input = { ...input, ...extra };
  try {
    if (gate.kind === 'discriminator') {
      const condition = gate.condition;
      if (condition === null || typeof condition !== 'object' ||
        !('propertyName' in condition) ||
        typeof condition.propertyName !== 'string' ||
        !('values' in condition) || !Array.isArray(condition.values)) return false;
      const value = hasOwnProperty(input, condition.propertyName)
        ? input[condition.propertyName] : undefined;
      return condition.values.some((candidate: unknown) => Object.is(candidate, value));
    }
    if (gate.kind === 'if') {
      const predicate = context.root.runtime.ifPredicates.get(gate);
      if (!predicate) throw new Error(`Missing if predicate at ${gate.schemaPath}`);
      const result = predicate(input);
      return gate.negated ? !result : result;
    }
    const expression = context.root.runtime.blueprint?.expressions.find(
      (candidate) => candidate.schemaPath === gate.schemaPath &&
        candidate.key === 'active',
    );
    if (expression) {
      const dependencies = expression.dependencies.map((dependency) => {
        const path = resolveDependencyPath(hostPath, dependency);
        return path === '@' ? extra : readProjectedValue(context, path);
      });
      return Boolean(expression.evaluate(dependencies));
    }
    return gate.condition === true;
  } catch (cause) {
    if (!context.failure) {
      context.failure = new SchemaFormError(
        gate.kind === 'if' ? GUARD_FAILED : EXPRESSION_THREW,
        `Gate evaluation failed at ${gate.schemaPath}`,
        { path: hostPath, schemaPath: gate.schemaPath, cause },
      );
      context.cause = 'expression';
    }
    return false;
  }
};
