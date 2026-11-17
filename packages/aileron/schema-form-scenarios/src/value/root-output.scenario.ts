import type { FormScenario } from '../types';

/** Whole-form writes interpret child values before exposing output. */
export const rootOutputScenario = {
  name: 'value.root-output',
  schema: { type: 'object', properties: {
    title: { type: 'string' }, count: { type: 'number' },
  } },
  steps: [
    { action: 'setValue', path: '', value: { title: 'A', count: '2' },
      expect: { values: { '/count': 2 }, outputValue: { title: 'A', count: 2 } } },
    { action: 'setValue', path: '/title', value: 'B',
      expect: { values: { '/title': 'B' }, outputValue: { title: 'B', count: 2 } } },
  ],
} satisfies FormScenario;
