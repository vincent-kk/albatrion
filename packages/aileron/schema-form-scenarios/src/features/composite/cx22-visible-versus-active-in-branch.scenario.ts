import type { CompositeCase } from './types';

/** A branch holding a hidden-but-kept field and a removed field, beside another branch. */
const branchControlsSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  properties: { show: { type: 'boolean' }, use: { type: 'boolean' } },
  oneOf: [
    { properties: { kind: { const: 'a' },
      hidden: { type: 'string', minLength: 3, controls: { visible: '../show === true' } },
      removed: { type: 'string', controls: { active: '../use === true' } } } },
    { properties: { kind: { const: 'b' }, other: { type: 'string' } } },
  ],
};

/** CX-22: inside a branch, visible false keeps the value and its issues while active false removes the value. */
export const cx22VisibleVersusActiveInBranch: CompositeCase = {
  scenario: {
    name: 'composite.cx22-visible-versus-active-in-branch',
    description: 'CONTROLS-022 visible false only hides: the value stays in the output and is still validated; CONTROLS-021 active false removes the node and its value. Both hold inside a oneOf branch and across a switch away and back.',
    schema: branchControlsSchema,
    initialValue: { kind: 'a', show: false, use: false, hidden: 'h', removed: 'r' },
    steps: [
      { action: 'batch', steps: [], expect: {
        states: { '/hidden': { isVisible: false } }, values: { '/hidden': 'h' }, errors: { '/hidden': [{ keyword: 'minLength' }] }, shape: { '/removed': 'absent' },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'b' }], expect: { shape: { '/hidden': 'absent', '/other': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'a' }], expect: { values: { '/hidden': 'h' }, states: { '/hidden': { isVisible: false } } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/show', value: true }, { action: 'setValue', path: '/use', value: true }], expect: {
        states: { '/hidden': { isVisible: true } }, shape: { '/removed': 'present' },
      } },
    ],
  },
};
