import { describe, expect, it } from 'vitest';

import cases from '../../../../../fixtures/input-responsiveness/closing-cases.json';
import { closingGateFixture } from '../../stageClosing/__tests__/fixtures/closingGateFixture';
import { summarizePage } from '../../summarizePage';
import { deriveStateVocabularyValidatorWork } from '../deriveStateVocabularyValidatorWork';

/** Every existing row receives fresh raw pages so non-gated rows cannot escape SV-2. */
function fixture() {
  const source = closingGateFixture().pages['stream-0'];
  const samples = cases.flatMap((id) =>
    ['B', 'F'].map((lane) => {
      const page = structuredClone(source);
      page.closing.validatorWork = [
        { kind: 'compile', start: 1, end: 2 },
        { kind: 'validate', start: 3, end: 4 },
      ];
      return {
        id,
        lane,
        index: 0,
        file: id + lane,
        summary: summarizePage(page),
        page,
      };
    }),
  );
  return {
    samples,
    pages: Object.fromEntries(samples.map((s) => [s.file, s.page])),
  };
}
describe('SV-2 all-row validator equality', () => {
  it('passes equal compile and validate work on every closing row', () => {
    const data = fixture();
    const result = deriveStateVocabularyValidatorWork(data.samples, data.pages);
    expect(result.status).toBe('PASS');
    expect(result.checks.map((c) => c.id)).toEqual(cases);
  });
  it.each(['compile', 'validate'])(
    'fails additional %s work on a report-only None row',
    (kind) => {
      const data = fixture();
      const page = data.pages['mount-flat-500-noneF'];
      const existing = page.closing.validatorWork.find(
        (work) => work.kind === kind,
      );
      if (!existing) throw new Error('Missing work fixture');
      page.closing.validatorWork.push({ ...existing });
      expect(
        deriveStateVocabularyValidatorWork(data.samples, data.pages).status,
      ).toBe('FAIL');
    },
  );
  it('preserves missing row evidence as indeterminate', () => {
    const data = fixture();
    expect(
      deriveStateVocabularyValidatorWork(data.samples.slice(1), data.pages)
        .status,
    ).toBe('INDETERMINATE');
  });
});
