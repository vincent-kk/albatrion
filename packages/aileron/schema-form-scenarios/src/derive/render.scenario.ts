import type { FormScenario } from '../types';

/** Ledger expectations for the derive/inject render dispositions. */
export const deriveRenderScenarios: readonly FormScenario[] = [
  {
    name: 'derive.active-dependency-preserves-derived-edit',
    description: 'computed.derived: LANDING-163 tracks each expression separately; LANDING-014 only changed derived dependencies trigger writes.',
    schema: { type: 'object', properties: {
      source: { type: 'string' }, gate: { type: 'number' },
      target: { type: 'string', controls: { active: '../gate >= 0', derived: '../source' } },
    } }, initialValue: { source: 'A', gate: 1 },
    steps: [
      { action: 'setValue', path: '/target', value: 'manual', expect: { values: { '/target': 'manual' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/gate', value: 2 }], expect: { values: { '/target': 'manual' } } },
      { action: 'setValue', path: '/source', value: 'B', expect: { outputValue: { source: 'B', gate: 2, target: 'B' } } },
    ],
  },
  {
    name: 'derive.derived-chain-manual-edits',
    description: 'computed.derived: LANDING-014 derived is edge-triggered; LANDING-022 settles at synchronous entry.',
    schema: { type: 'object', properties: {
      source: { type: 'number' },
      twice: { type: 'number', controls: { derived: '../source * 2' } },
      total: { type: 'number', controls: { derived: '../twice + 1' } },
    } }, initialValue: { source: 2 },
    steps: [
      { action: 'setValue', path: '/source', value: 3, expect: { outputValue: { source: 3, twice: 6, total: 7 } } },
      { action: 'setValue', path: '/total', value: 99, expect: { values: { '/total': 99 } } },
      { action: 'setValue', path: '/source', value: 4, expect: { outputValue: { source: 4, twice: 8, total: 9 } } },
    ],
  },
  {
    name: 'derive.sibling-injection-branch',
    description: 'injectTo: LANDING-004 no automatic const selection; LANDING-030 source edges may form a chain.',
    schema: { type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: (value: unknown) => ({ '../kind': value }) } },
      kind: { type: 'string', controls: { injectTo: (value: unknown) => ({ '../copy': value }) } },
      copy: { type: 'string' },
    }, oneOf: [{ controls: { active: './kind === "a"' }, properties: { a: { type: 'string', default: 'A' } } }] },
    initialValue: { source: 'off' },
    steps: [{ action: 'setValue', path: '/source', value: 'a', expect: {
      shape: { '/a': 'present' }, outputValue: { source: 'a', kind: 'a', copy: 'a', a: 'A' },
    } }],
  },
  {
    name: 'derive.parent-array-injection',
    description: 'injectTo: source-relative parent and array paths receive the settled emitted value.',
    schema: { type: 'object', properties: {
      group: { type: 'object', properties: { source: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../../target': value, '../../rows/0': value }),
      } } } }, target: { type: 'string' }, rows: { type: 'array', items: { type: 'string' } },
    } }, initialValue: { group: { source: 'A' }, rows: ['old'] },
    steps: [{ action: 'setValue', path: '/group/source', value: 'B', expect: {
      outputValue: { group: { source: 'B' }, target: 'B', rows: ['B'] },
      values: { '/rows/0': 'B', '/target': 'B' },
    } }],
  },
  {
    name: 'derive.injection-preserves-null-ancestor',
    description: 'nullable.object-write-provenance and pending-read: injectTo renders the child value without promoting null.',
    schema: { type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: (value: unknown) => ({ '../target/name': value }) } },
      target: { type: ['object', 'null'], properties: { name: { type: 'string' } } },
    } }, initialValue: { source: 'initial', target: null },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/target', value: null }], expect: { outputValue: { source: 'initial', target: null } } },
      { action: 'setValue', path: '/source', value: 'automatic', expect: {
        values: { '/target/name': 'automatic' }, outputValue: { source: 'automatic', target: null },
      } },
      { action: 'setValue', path: '/target/name', value: 'input', expect: {
        outputValue: { source: 'automatic', target: { name: 'input' } },
      } },
    ],
  },
  {
    name: 'derive.derived-preserves-null-ancestor',
    description: 'nullable.object-pending-read-readers: LANDING-139 null is preserved by automatic writes; LANDING-014 source edges settle derived children.',
    schema: { type: 'object', properties: {
      source: { type: 'string' },
      target: { type: ['object', 'null'], properties: {
        name: { type: 'string', controls: { derived: '../../source' } },
      } },
    } }, initialValue: { source: 'A', target: null },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/target', value: null }], expect: { outputValue: { source: 'A', target: null } } },
      { action: 'setValue', path: '/source', value: 'B', expect: {
      values: { '/target/name': 'B' }, outputValue: { source: 'B', target: null },
    } }],
  },
];
