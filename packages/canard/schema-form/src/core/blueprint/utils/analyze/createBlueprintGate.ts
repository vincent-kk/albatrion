import type { BlueprintGate } from '../../type';
import { collectGateEvaluationReads } from './collectGateEvaluationReads';

/**
 * Capture location-independent expression reads on a reusable gate.
 * @param gate - Authored gate fields with their first template host
 * @returns Frozen gate with location-independent expression read metadata
 */
export const createBlueprintGate = (
  gate: Omit<BlueprintGate, 'evaluationReads'>,
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
