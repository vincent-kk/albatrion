import type { FormScenario } from '../../types';

/**
 * Array-level and item-level constraints. `tags` keeps the default omitEmpty, so an empty list leaves the output
 * and its minItems never reaches the validator; `codes` opts out with omitEmpty false and stays checked.
 */
const tagsSchema = {
  type: 'object',
  properties: {
    tags: { type: 'array', minItems: 1, maxItems: 2, uniqueItems: true, items: { type: 'string', minLength: 2 } },
    codes: { type: 'array', minItems: 1, items: { type: 'string' }, options: { omitEmpty: false } },
  },
};

/** Array constraints follow verbs: errors land on the array host or on the offending item. */
export const arrayConstraintsScenario: FormScenario = {
  name: 'structure.array-constraint-errors',
  description: 'VALIDATE-043 (2)(4) array-level keywords stay on the array host and item keywords on the item node; LANDING-116 minItems is checked, not filled; VALUE-034 default omitEmpty does not emit an empty array and VALIDATE-001 the verdict reads the emitted value, so only the omitEmpty false array reports minItems.',
  schema: tagsSchema,
  initialValue: { tags: [], codes: [] },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/tags/0': 'absent', '/codes/0': 'absent' }, outputValue: { codes: [] },
      errors: { '/tags': [], '/codes': [{ keyword: 'minItems' }] },
    } },
    { action: 'push', path: '/codes', value: 'c1', expect: { outputValue: { codes: ['c1'] }, errors: { '/codes': [] } } },
    { action: 'push', path: '/tags', value: 'ok', expect: { outputValue: { tags: ['ok'], codes: ['c1'] }, errors: { '/tags': [], '/tags/0': [] } } },
    { action: 'push', path: '/tags', value: 'x', expect: { errors: { '/tags': [], '/tags/1': [{ keyword: 'minLength' }] } } },
    { action: 'push', path: '/tags', value: 'zz', expect: {
      outputValue: { tags: ['ok', 'x', 'zz'], codes: ['c1'] },
      errors: { '/tags': [{ keyword: 'maxItems' }], '/tags/1': [{ keyword: 'minLength' }], '/tags/2': [] },
    } },
    { action: 'remove', path: '/tags', index: 1, expect: {
      outputValue: { tags: ['ok', 'zz'], codes: ['c1'] }, errors: { '/tags': [], '/tags/0': [], '/tags/1': [] },
    } },
    { action: 'update', path: '/tags', index: 1, value: 'ok', expect: {
      outputValue: { tags: ['ok', 'ok'], codes: ['c1'] }, errors: { '/tags': [{ keyword: 'uniqueItems' }], '/tags/1': [] },
    } },
    { action: 'clear', path: '/tags', expect: {
      shape: { '/tags/0': 'absent' }, outputValue: { codes: ['c1'] }, errors: { '/tags': [] },
    } },
    { action: 'clear', path: '/codes', expect: { outputValue: { codes: [] }, errors: { '/codes': [{ keyword: 'minItems' }] } } },
  ],
};
