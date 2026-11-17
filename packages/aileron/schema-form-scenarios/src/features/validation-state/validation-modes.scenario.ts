import type { FormScenario } from '../../types';
import type { KeywordsByPath, ValidationModeName } from './types';

/** Two bounded fields that both become invalid through screen input. */
const boundedSchema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 }, age: { type: 'integer', minimum: 18 } },
};

/** Screen input that leaves both fields invalid; consumers read errors before and after an explicit request. */
export const modeTimingScenario: FormScenario = {
  name: 'validation-state.mode-timing',
  description: 'VALIDATE-049 OnChange validates each entry and OnRequest waits for a request; VALIDATE-008 None gives no verdict, which is not a pass. The form mode comes from validationModeCases.',
  schema: boundedSchema,
  initialValue: { name: 'Kim', age: 20 },
  steps: [
    { action: 'setValue', path: '/name', value: 'ab', expect: { values: { '/name': 'ab' } } },
    { action: 'setValue', path: '/age', value: 10, expect: { values: { '/age': 10 }, outputValue: { name: 'ab', age: 10 } } },
  ],
};

/** One validation mode with the issues held after screen input and after an explicit validate request. */
export interface ValidationModeCase {
  /** Story and test label for the mode. */
  readonly mode: ValidationModeName;
  /** Keywords per node right after the scenario's input, before any request. */
  readonly afterInput: KeywordsByPath;
  /** Keywords per node after the consumer calls the handle's validate. */
  readonly afterRequest: KeywordsByPath;
}

const invalid: KeywordsByPath = { '/name': ['minLength'], '/age': ['minimum'] };
const clean: KeywordsByPath = { '/name': [], '/age': [] };

/** Form props for modeTimingScenario: one case per validation mode. */
export const validationModeCases: readonly ValidationModeCase[] = [
  { mode: 'OnChange', afterInput: invalid, afterRequest: invalid },
  { mode: 'OnRequest', afterInput: clean, afterRequest: invalid },
  { mode: 'None', afterInput: clean, afterRequest: clean },
];
