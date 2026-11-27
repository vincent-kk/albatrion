import type { FormScenario } from '../../types';

/** Two bounded fields loaded valid. */
const boundedSchema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 2 }, age: { type: 'integer', minimum: 0 } },
};

/** The handle writes the whole value, reads it back with its issues, and reset loads the committed defaults. */
export const handleRoundTripScenario: FormScenario = {
  name: 'handle-layout.handle-round-trip',
  description: 'FormHandle setValue writes the whole value and getValue reads the emitted value; validate returns the issues held on nodes; reset loads the committed props again and clears the verdict (WRITE-044). Keywords after validate come from handleRoundTripIssues.',
  schema: boundedSchema,
  initialValue: { name: 'Kim', age: 3 },
  steps: [
    { action: 'setValue', path: '', value: { name: 'a', age: -1 }, expect: {
      outputValue: { name: 'a', age: -1 }, errors: { '/name': [{ keyword: 'minLength' }], '/age': [{ keyword: 'minimum' }] },
    } },
    { action: 'reset', expect: { outputValue: { name: 'Kim', age: 3 }, errors: { '/name': [], '/age': [] } } },
  ],
};

/** Keywords handle.validate() returns, in document order, after writing the invalid value. */
export const handleRoundTripIssues: readonly string[] = ['minLength', 'minimum'];
