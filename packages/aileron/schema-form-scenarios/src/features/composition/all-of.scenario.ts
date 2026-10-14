import type { FormScenario } from '../../types';

/** BLUEPRINT-004: ungated allOf entries always contribute declarations, defaults, and required keys. */
const mergedSchema = {
  type: 'object', properties: { name: { type: 'string' } }, required: ['name'],
  allOf: [
    { properties: { email: { type: 'string' } }, required: ['email'] },
    { properties: { email: { type: 'string', minLength: 3 }, phone: { type: 'string', default: '000' } } },
  ],
};

/**
 * Constraints on the same node from several allOf entries apply together. A deliberately empty range comes
 * from one contribution: split across entries it is an inverted intersection and a blueprint error (SCHEMA-045).
 */
const conjunctionSchema = {
  type: 'object', properties: { code: { type: 'string' }, size: { type: 'number' } },
  allOf: [
    { properties: { code: { minLength: 2 } } },
    { properties: { code: { maxLength: 4, pattern: '^[A-Z]+$' }, size: { minimum: 10, maximum: 5 } } },
  ],
};

/** allOf merge and conjunction cases checked by the registered validator. */
export const allOfScenarios: readonly FormScenario[] = [
  {
    name: 'composition.allof-merged-required',
    description: 'BLUEPRINT-004 ungated allOf entries are static; LANDING-010 allOf merges; VALIDATE-043 (2) required errors land on the missing child.',
    schema: mergedSchema,
    initialValue: {},
    steps: [
      { action: 'batch', steps: [], expect: {
        shape: { '/name': 'present', '/email': 'present', '/phone': 'present' },
        outputValue: { phone: '000' },
        errors: { '/name': [{ keyword: 'required' }], '/email': [{ keyword: 'required' }] },
      } },
      { action: 'setValue', path: '/email', value: 'ab', expect: {
        outputValue: { email: 'ab', phone: '000' }, errors: { '/email': [{ keyword: 'minLength' }] },
      } },
      { action: 'setValue', path: '/email', value: 'abc', expect: { errors: { '/email': [] } } },
      { action: 'setValue', path: '/name', value: 'Lee', expect: {
        outputValue: { name: 'Lee', email: 'abc', phone: '000' }, errors: { '/name': [], '/email': [], '': [] },
      } },
    ],
  },
  {
    name: 'composition.allof-constraint-conjunction',
    description: 'BLUEPRINT-004 allOf constraints intersect on one node; VALIDATE-043 (5) allOf errors are never filtered; SCHEMA-045 contradictory bounds from one contribution pass to the validator and keep the node invalid.',
    schema: conjunctionSchema,
    initialValue: {},
    steps: [
      { action: 'setValue', path: '/code', value: 'a', expect: { errors: { '/code': [{ keyword: 'minLength' }, { keyword: 'pattern' }] } } },
      { action: 'setValue', path: '/code', value: 'ABCDE', expect: { errors: { '/code': [{ keyword: 'maxLength' }] } } },
      { action: 'setValue', path: '/code', value: 'ABC', expect: { outputValue: { code: 'ABC' }, errors: { '/code': [] } } },
      { action: 'setValue', path: '/size', value: 7, expect: {
        outputValue: { code: 'ABC', size: 7 }, errors: { '/size': [{ keyword: 'maximum' }, { keyword: 'minimum' }] },
      } },
      { action: 'setValue', path: '/size', value: 12, expect: { errors: { '/size': [{ keyword: 'maximum' }] } } },
    ],
  },
];
