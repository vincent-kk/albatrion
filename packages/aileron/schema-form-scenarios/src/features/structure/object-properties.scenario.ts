import type { FormScenario } from '../../types';

/** Declared properties become nodes; undeclared keys stay extras whatever additionalProperties says. */
const accountSchema = {
  type: 'object', required: ['name'], additionalProperties: false,
  properties: {
    name: { type: 'string' },
    meta: { type: 'object', properties: { tag: { type: 'string' } }, additionalProperties: { type: 'string' } },
  },
};

/** Object properties, required keys, and both additionalProperties forms checked by the validator. */
export const objectPropertiesScenario: FormScenario = {
  name: 'structure.object-properties-extras',
  description: 'FRAGMENT-019 the form does not read additionalProperties false; SCHEMA-040 undeclared keys stay extras and are emitted; VALIDATE-043 (2)(3) required errors land on the child and rejected keys on the host.',
  schema: accountSchema,
  initialValue: { name: 'Lee', meta: { tag: 't', note: 'x' } },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/name': 'present', '/meta/tag': 'present', '/meta/note': 'absent' },
      outputValue: { name: 'Lee', meta: { tag: 't', note: 'x' } }, errors: { '': [], '/meta': [] },
    } },
    { action: 'setValue', path: '', value: { name: 'Lee', meta: { tag: 't' }, stray: 1 }, expect: {
      shape: { '/stray': 'absent' }, outputValue: { name: 'Lee', meta: { tag: 't' }, stray: 1 },
      errors: { '': [{ keyword: 'additionalProperties' }] },
    } },
    { action: 'clear', path: '/name', expect: {
      outputValue: { meta: { tag: 't' }, stray: 1 }, errors: { '/name': [{ keyword: 'required' }] },
    } },
    { action: 'setValue', path: '/meta', value: { tag: 't2', note: 'y', more: 'z' }, expect: {
      shape: { '/meta/note': 'absent', '/meta/more': 'absent' }, values: { '/meta/tag': 't2' },
      outputValue: { meta: { tag: 't2', note: 'y', more: 'z' }, stray: 1 }, errors: { '/meta': [] },
    } },
    { action: 'setValue', path: '/meta', value: { tag: 't2', bad: 3 }, expect: {
      outputValue: { meta: { tag: 't2', bad: 3 }, stray: 1 }, errors: { '/meta': [], '/meta/tag': [] },
    } },
  ],
};
