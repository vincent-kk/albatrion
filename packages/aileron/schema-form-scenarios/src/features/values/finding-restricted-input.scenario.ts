import type { FormScenario } from '../../types';
import { optionsSchema } from './literal-and-format.scenario';

/**
 * Built-in inputs preserve the display of strings outside their enum or date domain. The enum select adds a
 * disabled option for the raw value, and a malformed date uses an editable text input. Validation still reports
 * the enum violation on the node.
 */
export const restrictedInputFindingScenario: FormScenario = {
  name: 'values.finding-restricted-input-out-of-domain',
  description: 'The string enum select displays the out-of-set value "XL" in a leading disabled option, and the date input displays "not-a-date" verbatim as editable text, so both displays agree with the node values while the enum violation stays visible to validation.',
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
