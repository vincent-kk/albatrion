import type { CompositeCase } from './types';

/** Org chart: a recursive member tree. */
const orgSchema = {
  $defs: { member: { type: 'object', properties: { name: { type: 'string' }, reports: { type: 'array', items: { $ref: '#/$defs/member' } } } } },
  $ref: '#/$defs/member',
};

/** Three levels; A has three reports so its list passes the gate threshold below. */
const orgValue = {
  name: 'CEO',
  reports: [
    { name: 'A', reports: [{ name: 'A1', reports: [] }, { name: 'A2', reports: [] }, { name: 'A3', reports: [] }] },
    { name: 'B', reports: [] },
    { name: 'C', reports: [] },
  ],
};

/** CX-02: a deferred deep member is written, revealed by focus, extended and reset. */
export const cx02OrgChart: CompositeCase = {
  scenario: {
    name: 'composite.cx02-org-chart',
    description: 'C2 org chart (G1, G10, G5). A recursive $ref tree under virtualization: TEST-020 a deferred member is built and written through the handle before it mounts; a push under another member creates its path; reset restores the load. The tail checks that a focus command on the deferred member reveals it with its name input (GOAL-061 T-3), that typing into it makes it dirty, and that reset clears dirty (CONTROLS-029).',
    schema: orgSchema,
    initialValue: orgValue,
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/reports/0/reports/2/name': 'A3', '/reports/2/name': 'C' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/reports/0/reports/2/name', value: 'A3x' }], expect: { values: { '/reports/0/reports/2/name': 'A3x' } } },
      { action: 'push', path: '/reports/1/reports', value: { name: 'B1', reports: [] }, expect: { values: { '/reports/1/reports/0/name': 'B1' } } },
      { action: 'reset', expect: { values: { '/reports/0/reports/2/name': 'A3', '/reports/1/reports': [] } } },
    ],
  },
  props: { virtualization: { threshold: 3, eagerCount: 1, rootMargin: '0px', backfill: 'none', estimateHeight: 40 } },
  tailStart: orgValue,
  tail: [
    { act: 'focus', path: '/reports/0/reports/2' },
    { act: 'mounted', mounted: { '/reports/0/reports/2/name': true } },
    { act: 'type', path: '/reports/0/reports/2/name', text: 'y' },
    { act: 'states', states: { '/reports/0/reports/2/name': { dirty: true } } },
    { act: 'reset' },
    { act: 'states', states: { '/reports/0/reports/2/name': { dirty: false } } },
  ],
};
