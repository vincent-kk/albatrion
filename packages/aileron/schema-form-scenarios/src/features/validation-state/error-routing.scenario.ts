import type { FormScenario } from '../../types';

/** A nested object with a required child beside a filled sibling, and an array whose items carry their own bound. */
const teamSchema = {
  type: 'object',
  properties: {
    owner: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, role: { type: 'string' } } },
    tags: { type: 'array', items: { type: 'string', minLength: 2 } },
  },
};

/** Issues land on the deepest node that owns the rejected value and leave its ancestors and siblings clean. */
export const errorRoutingScenario: FormScenario = {
  name: 'validation-state.error-routing',
  description: 'VALIDATE-043 (2) issues route by dataPath and a required issue goes to the missing child; item issues land on the item, not the array; fixing a value clears only its own issue. The owner object carries a role so VALUE-034 does not omit it as empty before validation (VALIDATE-001).',
  schema: teamSchema,
  initialValue: { owner: { role: 'lead' }, tags: ['ok', 'x'] },
  steps: [
    { action: 'batch', steps: [], expect: {
      errors: { '': [], '/owner': [], '/owner/name': [{ keyword: 'required' }], '/tags': [], '/tags/0': [], '/tags/1': [{ keyword: 'minLength' }] },
    } },
    { action: 'setValue', path: '/owner/name', value: 'Lee', expect: {
      values: { '/owner/name': 'Lee' }, errors: { '/owner/name': [], '/tags/1': [{ keyword: 'minLength' }] },
    } },
    { action: 'update', path: '/tags', index: 1, value: 'xy', expect: {
      outputValue: { owner: { role: 'lead', name: 'Lee' }, tags: ['ok', 'xy'] }, errors: { '/tags/1': [], '/tags': [] },
    } },
  ],
};
