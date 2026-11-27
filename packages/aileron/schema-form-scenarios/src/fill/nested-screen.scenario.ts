import type { FormScenario } from '../types';

/** LANDING-116: minItems constrains input; it does not synthesize array rows. */
export const nestedFillScenarios: readonly FormScenario[] = [
  {
    name: 'LANDING-116 nested schema and external defaults survive reset without minItems filling',
    schema: { type: 'object', properties: {
      profile: { type: 'object', properties: { name: { type: 'string', default: 'schema' } } },
      rows: { type: 'array', minItems: 3, items: { type: 'object', properties: { title: { type: 'string', default: 'row' }, tags: { type: 'array', minItems: 2, items: { type: 'string' } } } } },
    } },
    initialValue: { profile: { name: 'external' }, rows: [{ tags: [] }] },
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: { profile: { name: 'external' }, rows: [{ title: 'row' }] }, shape: { '/rows/0/title': 'present', '/rows/1': 'absent', '/rows/0/tags/0': 'absent' } } },
      { action: 'setValue', path: '/profile/name', value: 'edited' },
      { action: 'reset', expect: { values: { '/profile/name': 'external', '/rows/0/title': 'row' }, shape: { '/rows/1': 'absent' } } },
    ],
  },
] satisfies readonly FormScenario[];
