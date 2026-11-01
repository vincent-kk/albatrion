import type {
  StageClosingPage,
  ValidatorWorkException,
  ValidatorWorkRow,
} from '../../stageClosingTypes';
import type { SampleResult } from '../summarizeResults';
import { readStageClosingValidatorWorkPage } from './readStageClosingValidatorWorkPage';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** Derive validator means and enforce registered F=B/no-unattributed rules independently of C0–C7. */
export function deriveStageClosingValidatorWork(
  samples: SampleResult[],
  pages: Record<string, StageClosingPage>,
  exceptions: ValidatorWorkException[] = rules.validatorWorkExceptions,
) {
  const rows: ValidatorWorkRow[] = [];
  for (const id of rules.validatorWorkRows)
    for (const lane of ['L', 'B', 'S', 'F']) {
      const group = samples.filter(
        (sample) => sample.id === id && sample.lane === lane,
      );
      if (!group.length) continue;
      const totals = group
        .map((sample) => readStageClosingValidatorWorkPage(pages[sample.file]))
        .reduce(
          (sum, page) => ({
            units: sum.units + page.units,
            compileCalls: sum.compileCalls + page.compileCalls,
            validateCalls: sum.validateCalls + page.validateCalls,
            setupCompileCalls: sum.setupCompileCalls + page.setupCompileCalls,
            setupValidateCalls:
              sum.setupValidateCalls + page.setupValidateCalls,
            lateCompileCalls: sum.lateCompileCalls + page.lateCompileCalls,
            lateValidateCalls: sum.lateValidateCalls + page.lateValidateCalls,
            unattributed: sum.unattributed + page.unattributed,
            operationsWithLongFrame:
              sum.operationsWithLongFrame + page.operationsWithLongFrame,
          }),
          {
            units: 0,
            compileCalls: 0,
            validateCalls: 0,
            setupCompileCalls: 0,
            setupValidateCalls: 0,
            lateCompileCalls: 0,
            lateValidateCalls: 0,
            unattributed: 0,
            operationsWithLongFrame: 0,
          },
        );
      rows.push({
        id,
        lane,
        units: totals.units,
        compileCalls: totals.compileCalls,
        validateCalls: totals.validateCalls,
        compileMean: totals.compileCalls / totals.units,
        validateMean: totals.validateCalls / totals.units,
        setupCompileCalls: totals.setupCompileCalls,
        setupValidateCalls: totals.setupValidateCalls,
        lateCompileCalls: totals.lateCompileCalls,
        lateValidateCalls: totals.lateValidateCalls,
        unattributed: totals.unattributed,
        operationsWithLongFrame: totals.operationsWithLongFrame,
        longFrameFraction: /^(reset|rebuild|validate)-/.test(id)
          ? totals.operationsWithLongFrame / totals.units
          : null,
      });
    }
  const checks = rules.validatorWorkRows.map((id) => {
    const B = rows.find((row) => row.id === id && row.lane === 'B'),
      F = rows.find((row) => row.id === id && row.lane === 'F');
    const violations: string[] = [];
    if (!B || !F || !B.units || !F.units)
      return {
        id,
        status: 'INDETERMINATE',
        violations: ['missing lane evidence'],
      };
    for (const metric of [
      'compileMean',
      'validateMean',
      'unattributed',
    ] as const) {
      const delta =
        metric === 'unattributed' ? F.unattributed : F[metric] - B[metric];
      if (
        delta !== 0 &&
        !exceptions.some(
          (entry) =>
            entry.id === id &&
            entry.metric === metric &&
            Math.abs(entry.delta - delta) <= 1e-9 &&
            entry.designCause.trim(),
        )
      )
        violations.push(metric);
    }
    return {
      id,
      status: violations.length ? 'FIX_REQUIRED' : 'PASS',
      violations,
    };
  });
  return {
    rows,
    checks,
    exceptions,
    status: checks.some((check) => check.status === 'FIX_REQUIRED')
      ? 'FIX_REQUIRED'
      : checks.some((check) => check.status === 'INDETERMINATE')
        ? 'INDETERMINATE'
        : 'PASS',
  };
}
