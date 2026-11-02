import cases from '../../../../fixtures/input-responsiveness/closing-cases.json';
import type { StageClosingPage } from '../../stageClosingTypes';
import { readStageClosingValidatorWorkPage } from '../stageClosing/readStageClosingValidatorWorkPage';
import type { SampleResult } from '../summarizeResults';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Report every row and enforce validator equality on registered deterministic rows, including setup and late work. */
export function deriveStateVocabularyValidatorWork(
  samples: SampleResult[],
  pages: Record<string, StageClosingPage>,
) {
  const rows = cases.flatMap((id) =>
    ['B', 'F'].map((lane) => {
      const group = samples
        .filter((s) => s.id === id && s.lane === lane)
        .map((s) => readStageClosingValidatorWorkPage(pages[s.file]));
      const units = group.reduce((sum, p) => sum + p.units, 0);
      const mean = (
        read: (
          p: ReturnType<typeof readStageClosingValidatorWorkPage>,
        ) => number,
      ) => (units ? group.reduce((sum, p) => sum + read(p), 0) / units : null);
      return {
        id,
        lane,
        units,
        compileMean: mean((p) => p.compileCalls),
        validateMean: mean((p) => p.validateCalls),
        setupCompileMean: mean((p) => p.setupCompileCalls),
        setupValidateMean: mean((p) => p.setupValidateCalls),
        lateCompileMean: mean((p) => p.lateCompileCalls),
        lateValidateMean: mean((p) => p.lateValidateCalls),
        unattributed: group.reduce((sum, p) => sum + p.unattributed, 0),
      };
    }),
  );
  const checks = rules.validatorWorkRows.map((id) => {
    const B = rows.find((r) => r.id === id && r.lane === 'B'),
      F = rows.find((r) => r.id === id && r.lane === 'F');
    if (!B?.units || !F?.units) return { id, status: 'INDETERMINATE' };
    return {
      id,
      status:
        B.compileMean === F.compileMean &&
        B.validateMean === F.validateMean &&
        B.setupCompileMean === F.setupCompileMean &&
        B.setupValidateMean === F.setupValidateMean &&
        B.lateCompileMean === F.lateCompileMean &&
        B.lateValidateMean === F.lateValidateMean &&
        B.unattributed === F.unattributed &&
        F.unattributed === 0
          ? 'PASS'
          : 'FAIL',
    };
  });
  return {
    id: 'SV-2',
    rows,
    checks,
    status: checks.some((c) => c.status === 'FAIL')
      ? 'FAIL'
      : checks.some((c) => c.status === 'INDETERMINATE')
        ? 'INDETERMINATE'
        : 'PASS',
  };
}
