import type { StageClosingFixture } from '../../browser-bench/interaction/stageClosingTypes';
import cases from './closing-cases.json';
import { getValidationAfterPaintFixture } from './getValidationAfterPaintFixture';
import ir6Cases from './ir-6-cases.json';

/** Preserve IR-6 schemas and add only the approved closing operation and mode levers. */
export function getStageClosingFixture(id: string): StageClosingFixture {
  if (!cases.includes(id)) throw new Error('Unknown closing fixture: ' + id);
  if (ir6Cases.includes(id)) return getValidationAfterPaintFixture(id);
  const source = getValidationAfterPaintFixture('mount-flat-500-validate');
  return {
    ...source,
    id,
    validationMode: id.endsWith('-onrequest') ? 2 : 1,
    showError: id.endsWith('-always') ? true : undefined,
    operation: id.startsWith('reset-')
      ? 'reset'
      : id.startsWith('rebuild-')
        ? 'rebuild'
        : id.startsWith('validate-')
          ? 'validate'
          : undefined,
  };
}
