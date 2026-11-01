import cases from '../../../../fixtures/input-responsiveness/ir-6-cases.json';
import type { ValidationAfterPaintPage } from '../../validationAfterPaintTypes';
import { deriveValidationAfterPaintResults } from '../deriveValidationAfterPaintResults';
import type { SampleResult } from '../summarizeResults';

/** Only rename the reference lane; the registered IR-6 round-6 derivation and gates run unchanged. */
export function deriveStageClosingReference(
  samples: SampleResult[],
  pages: Record<string, ValidationAfterPaintPage>,
  reference: 'B' | 'S',
) {
  return deriveValidationAfterPaintResults(
    samples
      .filter(
        (s) => cases.includes(s.id) && ['L', reference, 'F'].includes(s.lane),
      )
      .map((s) => ({ ...s, lane: s.lane === reference ? 'E' : s.lane })),
    'quiet',
    pages,
    'round-6',
  );
}
