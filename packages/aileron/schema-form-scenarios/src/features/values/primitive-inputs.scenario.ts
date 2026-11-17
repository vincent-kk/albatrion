import type { FormScenario } from '../../types';

/** One property per primitive kind, each rendered by the built-in input for that kind. */
const primitivesSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    count: { type: 'number' },
    whole: { type: 'integer' },
    flag: { type: 'boolean' },
    nothing: { type: 'null' },
  },
};

/** Screen input for the five primitive kinds reaches node values and the whole-form output. */
export const primitiveInputsScenario: FormScenario = {
  name: 'values.primitive-inputs',
  description: 'TEST-025 built-in inputs for string, number, integer, boolean, and null; REACT-027 and LANDING-196 a cleared non-nullable input sends undefined; WRITE-075 a whole write converts numeric strings for number and integer nodes.',
  schema: primitivesSchema,
  initialValue: { text: 'loaded', count: 1, whole: 2, flag: false, nothing: null },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/text': 'present', '/count': 'present', '/whole': 'present', '/flag': 'present', '/nothing': 'present' },
      outputValue: { text: 'loaded', count: 1, whole: 2, flag: false, nothing: null },
    } },
    { action: 'setValue', path: '/text', value: 'typed', expect: { values: { '/text': 'typed' } } },
    { action: 'setValue', path: '/count', value: 12.5, expect: { values: { '/count': 12.5 } } },
    { action: 'setValue', path: '/whole', value: 7, expect: { values: { '/whole': 7 } } },
    { action: 'setValue', path: '/flag', value: true, expect: {
      values: { '/flag': true }, outputValue: { text: 'typed', count: 12.5, whole: 7, flag: true, nothing: null },
    } },
    { action: 'clear', path: '/count', expect: {
      values: { '/count': undefined }, outputValue: { text: 'typed', whole: 7, flag: true, nothing: null },
    } },
    { action: 'clear', path: '/text', expect: { values: { '/text': undefined }, outputValue: { whole: 7, flag: true, nothing: null } } },
    { action: 'setValue', path: '', value: { text: 'whole', count: '3', whole: '4', flag: false, nothing: null }, expect: {
      values: { '/count': 3, '/whole': 4 }, outputValue: { text: 'whole', count: 3, whole: 4, flag: false, nothing: null },
    } },
    { action: 'reset', expect: { outputValue: { text: 'loaded', count: 1, whole: 2, flag: false, nothing: null } } },
  ],
};
