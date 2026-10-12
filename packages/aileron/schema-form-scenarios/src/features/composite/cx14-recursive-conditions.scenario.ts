import type { CompositeCase } from './types';

/** A recursive file tree under a root key containing "/" and "~": folders hold children, files hold a size. */
export const treeSchema = {
  $defs: {
    node: {
      type: 'object', properties: { kind: { type: 'string', enum: ['folder', 'file'] } },
      if: { properties: { kind: { const: 'folder' } }, required: ['kind'] },
      then: { properties: { children: { type: 'array', items: { $ref: '#/$defs/node' } } } },
      else: { properties: { size: { type: 'integer', minimum: 0 } } },
    },
  },
  type: 'object',
  properties: { 'a/b~c': { $ref: '#/$defs/node' } },
};

/** CX-14: conditions inside a recursive tree drop and restore subtrees and attribute errors to escaped paths. */
export const cx14RecursiveConditions: CompositeCase = {
  scenario: {
    name: 'composite.cx14-recursive-conditions',
    description: 'A $ref tree whose if/then/else picks children or size at every level, under a property whose name contains "/" and "~" and is addressed by its escaped JSON Pointer (~1, ~0): turning the top folder into a file drops its subtree and turning it back restores the raw subtree (LANDING-018); a bad size at the deepest file is attributed to that node. Dynamic additionalProperties keys are not nodes (SCHEMA-040), so the tree uses arrays. The same toggle one level down runs apart as composite.recursive-nested-gate.',
    schema: treeSchema,
    initialValue: { 'a/b~c': { kind: 'folder', children: [{ kind: 'folder', children: [{ kind: 'file', size: 1 }] }] } },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/a~1b~0c/children/0/children/0/size': 1 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/a~1b~0c/kind', value: 'file' }], expect: {
        shape: { '/a~1b~0c/children': 'absent', '/a~1b~0c/size': 'present' }, outputValue: { 'a/b~c': { kind: 'file' } },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/a~1b~0c/kind', value: 'folder' }], expect: {
        shape: { '/a~1b~0c/children': 'present' }, values: { '/a~1b~0c/children/0/children/0/size': 1 },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/a~1b~0c/children/0/children/0/size', value: -1 }], expect: {
        errors: { '/a~1b~0c/children/0/children/0/size': [{ keyword: 'minimum' }] },
      } },
    ],
  },
};
