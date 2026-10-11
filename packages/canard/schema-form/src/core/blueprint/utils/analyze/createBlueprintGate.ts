import type { BlueprintGate } from '../../type';
import { collectGateEvaluationReads } from './collectGateEvaluationReads';

/** Construction fields retain each kind's condition contract before reads are captured. */
type BlueprintGateInput = {
  [Kind in BlueprintGate['kind']]: Omit<
    Extract<BlueprintGate, { kind: Kind }>,
    'evaluationReads'
  >;
}[BlueprintGate['kind']];

/**
 * Capture location-independent expression reads on a reusable gate.
 * @param gate - Kind-specific condition and authored fields with their first template host
 * @returns Frozen gate retaining its condition contract and expression read metadata
 */
export const createBlueprintGate = (
  gate: BlueprintGateInput,
): BlueprintGate =>
  Object.freeze({
    ...gate,
    ...(gate.appliesWhen === undefined
      ? {}
      : { appliesWhen: Object.freeze([...gate.appliesWhen]) }),
    evaluationReads:
      gate.kind === 'active'
        ? collectGateEvaluationReads(gate.condition)
        : Object.freeze([]),
  });
