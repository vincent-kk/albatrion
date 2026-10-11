import type { FormScenario } from '../types';

/** LANDING-004: branch activation is authored, never inferred from const. */
const branchSchema = {
  type: 'object', properties: { kind: { type: 'string' } },
  oneOf: [
    { controls: { active: './kind === "a"' }, properties: {
      shared: { type: 'string' }, a: { type: 'string', default: 'A' },
    } },
    { controls: { active: './kind === "b"' }, properties: {
      shared: { type: 'string' }, b: { type: 'string', default: 'B' },
    } },
  ],
};

/** Ledger expectations for the composition and nullable render dispositions. */
export const unionRenderScenarios: readonly FormScenario[] = [
  {
    name: 'union.first-screen-active-defaults',
    description: 'composition.oneOf.initial: TEST-021 creation is settlement; LANDING-004 explicit active.',
    schema: branchSchema, initialValue: { kind: 'a' },
    steps: [{ action: 'batch', steps: [], expect: {
      shape: { '/a': 'present', '/b': 'absent' }, outputValue: { kind: 'a', a: 'A' },
    } }],
  },
  {
    name: 'union.branch-round-trip-shared-values',
    description: 'composition.oneOf.initial: LANDING-011 existing nodes are not filled again; LANDING-032 shared nodes retain raw.',
    schema: branchSchema, initialValue: { kind: 'a' },
    steps: [
      { action: 'setValue', path: '/a', value: 'edited', expect: { values: { '/a': 'edited' } } },
      { action: 'setValue', path: '/shared', value: 'shared', expect: { values: { '/shared': 'shared' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'b' }], expect: {
        shape: { '/a': 'absent', '/b': 'present' }, identity: { '/shared': '/shared' },
        outputValue: { kind: 'b', shared: 'shared', b: 'B' },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'a' }], expect: {
        shape: { '/a': 'present', '/b': 'absent' }, values: { '/a': 'edited' },
        outputValue: { kind: 'a', shared: 'shared', a: 'edited' },
      } },
    ],
  },
  {
    name: 'union.active-anyof-shared-fields',
    description: 'composition.anyOf: LANDING-018 raw survives deactivation; LANDING-038 effective schema merges active fragments.',
    schema: { type: 'object', properties: { left: { type: 'boolean' }, right: { type: 'boolean' } }, anyOf: [
      { controls: { active: './left' }, properties: { shared: { type: 'string' }, a: { type: 'string' } } },
      { controls: { active: './right' }, properties: { shared: { type: 'string' }, b: { type: 'string' } } },
    ] },
    initialValue: { left: true, right: true, shared: 'S', a: 'A', b: 'B' },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/a': 'present', '/b': 'present' }, values: { '/shared': 'S' } } },
      { action: 'setValue', path: '/left', value: false, expect: { shape: { '/a': 'absent', '/shared': 'present' }, identity: { '/shared': '/shared' } } },
      { action: 'setValue', path: '/left', value: true, expect: { values: { '/a': 'A', '/shared': 'S' } } },
    ],
  },
  {
    name: 'union.nested-branch-round-trip',
    description: 'composition.nested-branch: LANDING-018 deactivation removes output only; LANDING-032 retains the raw value.',
    schema: { type: 'object', properties: { shown: { type: 'boolean' } }, allOf: [{
      controls: { active: './shown' }, properties: { inner: { type: 'object', properties: {
        kind: { type: 'string' },
      }, oneOf: [
        { controls: { active: './kind === "a"' }, properties: { a: { type: 'string' } } },
        { controls: { active: './kind === "b"' }, properties: { b: { type: 'string' } } },
      ] } },
    }] },
    initialValue: { shown: true, inner: { kind: 'a', a: 'held' } },
    steps: [
      { action: 'setValue', path: '/inner/kind', value: 'b', expect: { shape: { '/inner/a': 'absent', '/inner/b': 'present' } } },
      { action: 'setValue', path: '/shown', value: false, expect: { shape: { '/inner': 'absent' }, outputValue: { shown: false } } },
      { action: 'setValue', path: '/shown', value: true, expect: { shape: { '/inner/b': 'present' }, values: { '/inner/kind': 'b' } } },
      { action: 'setValue', path: '/inner/kind', value: 'a', expect: { values: { '/inner/a': 'held' }, shape: { '/inner/a': 'present' } } },
    ],
  },
  {
    name: 'union.null-ancestor-input-promotion',
    description: 'nullable.object-null-branch: LANDING-139 null descendants are unfilled; LANDING-004 explicit activation.',
    schema: { type: 'object', properties: { account: { type: ['object', 'null'], properties: {
      kind: { type: 'string', default: 'a' },
    }, oneOf: [{ controls: { active: './kind === "a"' }, properties: { name: { type: 'string', default: 'default' } } }] } } },
    initialValue: { account: null },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/account', value: null }], expect: { outputValue: { account: null }, values: { '/account/kind': undefined }, shape: { '/account/name': 'absent' } } },
      { action: 'setValue', path: '/account/kind', value: 'a', expect: { shape: { '/account/name': 'present' }, values: { '/account/kind': 'a' } } },
      { action: 'setValue', path: '/account/name', value: 'typed', expect: { outputValue: { account: { kind: 'a', name: 'typed' } } } },
    ],
  },
  {
    name: 'union.nullable-conditional-account',
    description: 'NullableFormScenarios conditional account: LANDING-004 explicit activation; LANDING-018 retains null.',
    schema: { type: 'object', properties: { business: { type: 'boolean' } }, allOf: [
      { controls: { active: './business' }, properties: { company: { type: ['string', 'null'] } } },
    ] }, initialValue: { business: true, company: null },
    steps: [
      { action: 'setValue', path: '/business', value: false, expect: { shape: { '/company': 'absent' }, outputValue: { business: false } } },
      { action: 'setValue', path: '/business', value: true, expect: { shape: { '/company': 'present' }, outputValue: { business: true, company: null } } },
    ],
  },
  {
    name: 'union.typeless-object-branches',
    description: 'union.migration-shapes: LANDING-207 typeless inline object variants are object hosts.',
    schema: { oneOf: [{ type: 'object', properties: { name: { type: 'string' } } }, { type: 'null' }] },
    initialValue: { name: 'accepted' },
    steps: [{ action: 'batch', steps: [], expect: { shape: { '/name': 'present' }, outputValue: { name: 'accepted' } } }],
  },
  {
    name: 'union.typeless-literal-properties',
    description: 'union.migration-shapes: LANDING-208 const and enum properties derive their primitive kind.',
    schema: { type: 'object', properties: { kind: { const: 'fixed' }, count: { enum: [1, 2] } } },
    initialValue: { kind: 'fixed', count: 2 },
    steps: [{ action: 'batch', steps: [], expect: { shape: { '/kind': 'present', '/count': 'present' }, outputValue: { kind: 'fixed', count: 2 } } }],
  },
];
