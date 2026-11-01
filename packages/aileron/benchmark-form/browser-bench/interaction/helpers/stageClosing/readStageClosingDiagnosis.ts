import type { ClosingBound } from '../../stageClosingTypes';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** Include near-limit ratios and dual-bound metrics whose difference clause alone prevents failure. */
export function readStageClosingDiagnosis(
  bounds: Record<string, Record<string, ClosingBound>>,
  zeroMetrics: Record<string, string[]> = {},
) {
  return Object.entries(bounds).flatMap(([id, values]) => {
    const metrics = id.startsWith('type-')
      ? ['processing']
      : id.startsWith('mount-') &&
          !id.endsWith('-none') &&
          !id.startsWith('mount-if-')
        ? ['firstPainted', 'eagerPainted', 'longestFrame']
        : id.startsWith('validate-')
          ? ['resolutionTime']
          : /^(reset|rebuild)-/.test(id)
            ? ['callDuration', 'nextPainted']
            : [];
    return metrics.flatMap((metric) => {
      const bound = values[metric];
      if (
        !bound ||
        bound.upperBound === null ||
        zeroMetrics[id]?.includes(metric)
      )
        return [];
      if (
        typeof bound.upperBound === 'number' &&
        bound.upperBound > rules.diagnosisLower &&
        bound.upperBound <= rules.ratioLimit
      )
        return [
          {
            id,
            metric,
            bound: bound.upperBound,
            reason: 'ratio-in-diagnosis-band',
          },
        ];
      const dual = metric !== 'processing' && metric !== 'callDuration';
      return dual &&
        (bound.upperBound === '+Infinity' ||
          bound.upperBound > rules.ratioLimit) &&
        bound.differenceUpperBound !== null &&
        bound.differenceUpperBound <= rules.vsyncDifferenceMs
        ? [
            {
              id,
              metric,
              bound: bound.upperBound,
              reason: 'passes-difference-clause',
            },
          ]
        : [];
    });
  });
}
