import type { FormScenario } from '../types';

/** Only a newly created trailing object item receives its default on whole write. */
export const landing202Scenario = {
  name: 'array.landing-202',
  description: 'LANDING-202 LANDING-203: retained item stays empty; newly created item fills a to x.',
  schema: { type: 'array', items: { type: 'object', properties: {
    a: { type: 'string', default: 'x' },
  } } },
  initialValue: [{}],
  steps: [
    { action: 'setValue', path: '', value: [{}], expect: { outputValue: [{}] } },
    { action: 'setValue', path: '', value: [{}, {}], expect: {
      identity: { '/0': '/0' }, shape: { '/1': 'present' },
      outputValue: [{}, { a: 'x' }],
    } },
  ],
} satisfies FormScenario;
