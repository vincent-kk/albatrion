import type { FormScenario } from '../types';

/** A new load lifetime fills a missing declared value. */
export const mountDefaultScenario = {
  name: 'fill.mount-default',
  schema: { type: 'object', properties: {
    name: { type: 'string', default: 'filled' },
  } },
  initialValue: {},
  steps: [
    { action: 'reset', expect: { values: { '/name': 'filled' },
      outputValue: { name: 'filled' } } },
    { action: 'setValue', path: '/name', value: 'edited',
      expect: { outputValue: { name: 'edited' } } },
    { action: 'reset', expect: { outputValue: { name: 'filled' } } },
  ],
} satisfies FormScenario;
