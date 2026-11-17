import type { FormScenario } from '../types';

/** VALUE-036 treats a loaded null like a non-load null write (LANDING-200). */
export const nullPromotionScenarios = [
  {
    name: 'VALUE-036 loaded null leaves children unfilled until input promotion',
    schema: { type: ['object', 'null'], properties: { first: { type: 'string', default: 'hidden' }, second: { type: 'string', default: 'sibling' } } },
    initialValue: null,
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: null, values: { '/first': undefined, '/second': undefined } } },
      { action: 'setValue', path: '/first', value: 'typed', expect: { outputValue: { first: 'typed' }, values: { '/second': undefined } } },
    ],
  },
  {
    name: 'LANDING-200 child input promotes caller null without sibling filling',
    schema: { type: ['object', 'null'], properties: { first: { type: 'string', default: 'first' }, second: { type: 'string', default: 'second' } } },
    initialValue: { first: 'loaded', second: 'loaded' },
    steps: [
      { action: 'setValue', path: '', value: null, expect: { outputValue: null, values: { '/first': undefined, '/second': undefined } } },
      { action: 'setValue', path: '/first', value: 'typed', expect: { outputValue: { first: 'typed' }, values: { '/second': undefined } } },
      { action: 'reset', expect: { outputValue: { first: 'loaded', second: 'loaded' }, defaultValues: { '/first': 'loaded', '/second': 'loaded' } } },
    ],
  },
] satisfies readonly FormScenario[];
