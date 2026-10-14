import type { CompositeCase } from './types';

/** Permissions form: context mode drives read-only and visibility, and the owner injects an audit line. */
const permissionSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', controls: { readOnly: '@.mode === "view"' } },
    owner: { type: 'string', controls: { readOnly: '@.mode === "view"', injectTo: (value: unknown) => ({ '../audit': `by:${String(value)}` }) } },
    audit: { type: 'string', controls: { readOnly: '@.mode === "view"' } },
    secret: { type: 'string', controls: { visible: '@.mode === "admin"' } },
  },
};

/** CX-05: context modes change read-only and visibility without touching values; injection follows owner writes. */
export const cx05Permissions: CompositeCase = {
  scenario: {
    name: 'composite.cx05-permissions',
    description: 'C5 permissions (G4, G7). CONTROLS-080 `@` reads the context prop: view makes fields read-only and hides the admin field while its value stays (CONTROLS-022); controls.injectTo writes the audit line when the owner changes. The tail swaps the context edit, admin, view and checks states and values after each.',
    schema: permissionSchema,
    initialValue: { title: 'T', owner: 'lee', audit: 'by:lee', secret: 'S' },
    steps: [
      { action: 'batch', steps: [], expect: { states: { '/title': { readOnly: true }, '/secret': { visible: false } }, values: { '/secret': 'S' } } },
    ],
  },
  props: { context: { mode: 'view' } },
  tailStart: { title: 'T', owner: 'lee', audit: 'by:lee', secret: 'S' },
  tail: [
    { act: 'props', stage: { context: { mode: 'edit' } } },
    { act: 'states', states: { '/title': { readOnly: false }, '/secret': { visible: false } } },
    { act: 'write', path: '/owner', value: 'kim' },
    { act: 'values', values: { '/audit': 'by:kim' } },
    { act: 'props', stage: { context: { mode: 'admin' } } },
    { act: 'states', states: { '/secret': { visible: true }, '/owner': { readOnly: false } } },
    { act: 'props', stage: { context: { mode: 'view' } } },
    { act: 'states', states: { '/owner': { readOnly: true }, '/secret': { visible: false } } },
    { act: 'values', values: { '/owner': 'kim', '/audit': 'by:kim', '/secret': 'S' } },
  ],
};
