import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../../stageClosingTypes';
import { decideStageClosingGates } from '../stageClosing/decideStageClosingGates';
import type { SampleResult } from '../summarizeResults';
import { decideRatioFloor } from './decideRatioFloor';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Apply the closing timing gates, replacing only C1/C5 ratio-only policy and excluding C0/C7. */
export function decideStateVocabularyGates(
  rows: StageClosingRow[],
  bounds: Record<string, Record<string, ClosingBound>>,
  samples: SampleResult[],
  pages: Record<string, StageClosingPage>,
) {
  const adjusted = Object.fromEntries(
    Object.entries(bounds).map(([id, metrics]) => [
      id,
      Object.fromEntries(
        Object.entries(metrics).map(([metric, bound]) => {
          const floor =
            id.startsWith('type-') && metric === 'processing'
              ? rules.processingDifferenceMs
              : /^(reset|rebuild)-/.test(id) && metric === 'callDuration'
                ? rules.callDifferenceMs
                : undefined;
          if (floor === undefined) return [metric, bound];
          const pass = decideRatioFloor(bound, floor);
          return [
            metric,
            { ...bound, upperBound: pass === null ? null : pass ? 1 : 2 },
          ];
        }),
      ),
    ]),
  );
  return decideStageClosingGates(rows, adjusted, [], [], samples, pages)
    .filter((gate) => gate.id !== 'C0' && gate.id !== 'C7')
    .map((gate) => ({ ...gate, details: { closing: gate.details, bounds } }));
}
