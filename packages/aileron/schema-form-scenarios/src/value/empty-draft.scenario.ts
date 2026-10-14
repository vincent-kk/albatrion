import type { FormScenario } from '../types';

/** REACT-027 distinguishes nullable clearing from a caller's explicit empty string. */
export const emptyDraftScenario = {
  name: 'REACT-027 clearing a nullable string sends null instead of an empty string',
  schema: { type: 'object', properties: { text: { type: ['string', 'null'] } } },
  initialValue: { text: 'initial' },
  steps: [
    { action: 'setValue', path: '/text', value: '', expect: { values: { '/text': null }, outputValue: { text: null } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/text', value: '' }], expect: { values: { '/text': '' }, outputValue: {} } },
  ],
} satisfies FormScenario;

/** LANDING-196: the non-nullable input's empty value is undefined. */
export const nonNullableEmptyDraftScenario = {
  name: 'LANDING-196 non-nullable empty input sends undefined',
  schema: { type: 'object', properties: { text: { type: 'string' } } },
  initialValue: { text: 'initial' },
  steps: [{ action: 'setValue', path: '/text', value: '', expect: { values: { '/text': undefined }, outputValue: {} } }],
} satisfies FormScenario;
