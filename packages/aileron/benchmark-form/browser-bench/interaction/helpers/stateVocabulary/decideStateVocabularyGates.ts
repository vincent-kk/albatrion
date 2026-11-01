import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../../stageClosingTypes';
import { decideStageClosingGates } from '../stageClosing/decideStageClosingGates';
import type { SampleResult } from '../summarizeResults';
import { decideRatioFloor } from './decideRatioFloor';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Compose closing timing gates with C1 tail, C4 censoring and C5 call floors, excluding C0/C7. */
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
          if (id.startsWith('mount-') && metric === 'longestFrame')
            return [metric, metrics.flooredMountLongestFrame];
          const floor =
            id.startsWith('type-') && metric === 'processing'
              ? rules.processingDifferenceMs
              : /^(reset|rebuild)-/.test(id) && metric === 'callDuration'
                ? rules.callDifferenceMs
                : undefined;
          if (floor === undefined) return [metric, bound];
          const median = decideRatioFloor(bound, floor);
          const tail =
            id.startsWith('type-') && metric === 'processing'
              ? decideRatioFloor(
                  metrics.processingTail,
                  rules.processingTailDifferenceMs,
                )
              : true;
          const pass =
            median === false || tail === false
              ? false
              : median === null || tail === null
                ? null
                : true;
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
