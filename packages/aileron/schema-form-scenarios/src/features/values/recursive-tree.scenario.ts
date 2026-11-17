import type { FormScenario } from '../../types';

/** A self-referencing node definition: each node holds a required label and child nodes. */
const treeSchema = {
  $defs: {
    node: {
      type: 'object', required: ['label'],
      properties: { label: { type: 'string' }, children: { type: 'array', items: { $ref: '#/$defs/node' } } },
    },
  },
  $ref: '#/$defs/node',
};

/** Recursive references expand to the depth of the value and keep paths, verbs, and errors at every level. */
export const recursiveTreeScenario: FormScenario = {
  name: 'values.recursive-tree',
  description: 'TEST-025 root-local $defs references; recursion expands per value depth and items created by push take the same definition; 62C-01 sequential array methods keep item identity at depth; VALIDATE-043 (2) a required error lands on the deep child path.',
  schema: treeSchema,
  initialValue: { label: 'root', children: [{ label: 'a', children: [{ label: 'a1' }] }, { label: 'b' }] },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/label': 'present', '/children/0/children/0/label': 'present', '/children/1/label': 'present', '/children/0/children/1': 'absent' },
      outputValue: { label: 'root', children: [{ label: 'a', children: [{ label: 'a1' }] }, { label: 'b' }] },
    } },
    { action: 'setValue', path: '/children/0/children/0/label', value: 'deep', expect: { values: { '/children/0/children/0/label': 'deep' } } },
    { action: 'push', path: '/children/0/children', value: { label: 'a2' }, expect: {
      result: 2, shape: { '/children/0/children/1/label': 'present', '/children/0/children/1/children': 'present' },
      identity: { '/children/0/children/0': '/children/0/children/0' },
    } },
    { action: 'clear', path: '/children/0/children/1/label', expect: {
      errors: { '/children/0/children/1/label': [{ keyword: 'required' }], '/children/0/children/0/label': [] },
    } },
    { action: 'push', path: '/children/1/children', value: { label: 'b1' }, expect: {
      shape: { '/children/1/children/0/label': 'present' },
      outputValue: { label: 'root', children: [
        { label: 'a', children: [{ label: 'deep' }, {}] },
        { label: 'b', children: [{ label: 'b1' }] },
      ] },
    } },
    { action: 'remove', path: '/children', index: 0, expect: {
      identity: { '/children/0': '/children/1', '/children/0/children/0': '/children/1/children/0' },
      shape: { '/children/1': 'absent' }, outputValue: { label: 'root', children: [{ label: 'b', children: [{ label: 'b1' }] }] },
    } },
  ],
};
