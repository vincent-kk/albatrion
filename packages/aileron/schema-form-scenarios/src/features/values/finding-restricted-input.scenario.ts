import type { FormScenario } from '../../types';
import { optionsSchema } from './literal-and-format.scenario';

/**
 * Open question (07c G1), not a ledger defect: built-in inputs with a restricted display domain draw an
 * out-of-domain string as a valid state. The string enum select has no empty option and shows its first option;
 * the date input blanks a malformed string. REACT-027 governs only type-mismatched values and typeMismatch is
 * false here, so the ledger does not decide this; the expectations state what the screen would need to show.
 */
export const restrictedInputFindingScenario: FormScenario = {
  name: 'values.finding-restricted-input-out-of-domain',
  description: 'Open question for the owner: the string enum select draws an out-of-set value "XL" as its first option "S", and the date input draws "not-a-date" as an empty field, so the screen disagrees with the node value. REACT-027 covers only type-mismatched values (typeMismatch is false here) and REACT-033 does not promise enum or format meaning, so the ledger does not decide it.',
  schema: optionsSchema,
  initialValue: { version: 'v1' },
  steps: [
    { action: 'batch', steps: [{ action: 'setValue', path: '/size', value: 'XL' }], expect: {
      values: { '/size': 'XL' }, errors: { '/size': [{ keyword: 'enum' }] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/released', value: 'not-a-date' }], expect: {
      values: { '/released': 'not-a-date' }, outputValue: { size: 'XL', version: 'v1', released: 'not-a-date' },
    } },
  ],
};
