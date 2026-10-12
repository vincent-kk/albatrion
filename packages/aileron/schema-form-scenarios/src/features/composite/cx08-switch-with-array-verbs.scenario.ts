import type { CompositeCase } from './types';
import { reentryGuard, reentryOptions, reentryProperties, reentrySteps, reentryTail, reentryValue } from './reentry';

/** A kind discriminator with a tag list in one branch, plus the 197C-01 fields. */
const switchSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  properties: reentryProperties,
  options: reentryOptions,
  oneOf: [
    { properties: { kind: { const: 'list' }, tags: { type: 'array', items: { type: 'string' } } } },
    { properties: { kind: { const: 'single' }, tag: { type: 'string' } } },
  ],
  ...reentryGuard,
};

/** CX-08: array verbs interleave with branch switches, then other-kind re-entry and a virtual batch write. */
export const cx08SwitchWithArrayVerbs: CompositeCase = {
  scenario: {
    name: 'composite.cx08-switch-with-array-verbs',
    description: 'Array push and remove around branch switches: rows pushed before a switch are retained while the branch is closed (LANDING-018) and all four return with it; the batched push-and-switch variant runs apart as composite.batch-push-into-closing-branch; remove shifts identity (NODE-051); rapid round trips in one batch end where they started. Then 197C-01: R2 a virtual write beside another write in one batch reaches its fields, and the tail runs R1, other-kind re-entry inside a batch after a Merge write.',
    schema: switchSchema,
    initialValue: { kind: 'list', tags: [], ...reentryValue },
    steps: [
      { action: 'push', path: '/tags', value: 'a', expect: { values: { '/tags': ['a'] } } },
      { action: 'push', path: '/tags', value: 'b', expect: { values: { '/tags': ['a', 'b'] } } },
      { action: 'push', path: '/tags', value: 'c', expect: { values: { '/tags': ['a', 'b', 'c'] } } },
      { action: 'push', path: '/tags', value: 'd', expect: { values: { '/tags': ['a', 'b', 'c', 'd'] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'single' }], expect: { shape: { '/tags': 'absent', '/tag': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'list' }], expect: { shape: { '/tags': 'present' }, values: { '/tags': ['a', 'b', 'c', 'd'] } } },
      { action: 'remove', path: '/tags', index: 1, expect: { values: { '/tags': ['a', 'c', 'd'] }, identity: { '/tags/1': '/tags/2' } } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/kind', value: 'single' }, { action: 'setValue', path: '/kind', value: 'list' },
        { action: 'setValue', path: '/kind', value: 'single' }, { action: 'setValue', path: '/kind', value: 'list' },
      ], expect: { shape: { '/tags': 'present', '/tag': 'absent' }, values: { '/tags': ['a', 'c', 'd'] } } },
      ...reentrySteps,
    ],
  },
  tailStart: { kind: 'list', tags: ['a', 'c', 'd'], mode: 'text', value: 's', startDate: 's1', endDate: 'e1', note: 'y' },
  tail: reentryTail,
};
