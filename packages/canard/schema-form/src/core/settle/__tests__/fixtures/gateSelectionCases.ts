import type { BlueprintSchema } from '../../../blueprint';

/** Baseline histories include projection, short circuit, occurrence, and fallback boundaries. */
export const gateSelectionCases: {
  name: string; schema: BlueprintSchema; input: unknown;
  writes: { path?: string; value: unknown; merge?: boolean; context?: Record<string, unknown> }[];
}[] = [
  { name: 'whole expression, literal escapes, RFC6901, reverse equality, OR and includes',
    schema: { type: 'object', properties: { 'k/~': { type: 'string' } }, anyOf: [
      { controls: { active: "(('a\\x27b' === ./k~1~0))" }, properties: { a: { type: 'string', default: 'A' } } },
      { controls: { active: "['a\\x27b', 'b'].includes(./k~1~0)" }, properties: { b: { type: 'string', default: 'B' } } },
      { controls: { active: "(./k~1~0 === 'b') || (./k~1~0 === 'c');" }, properties: { c: { type: 'string', default: 'C' } } },
    ] }, input: { 'k/~': "a'b" }, writes: [{ path: '/k~1~0', value: 'b' }, { path: '/k~1~0', value: 'c' },
      { path: '/k~1~0', value: 'missing' }, { path: '/k~1~0', value: "a'b" }] },
  { name: 'strict primitive comparison and projection of missing values',
    schema: { type: 'object', properties: { kind: { type: ['string', 'number', 'boolean', 'null'] } }, anyOf: [
      { controls: { active: './kind === 0' }, properties: { zero: { type: 'boolean', default: true } } },
      { controls: { active: "./kind === '1'" }, properties: { text: { type: 'boolean', default: true } } },
      { controls: { active: './kind === null || ./kind === false || ./kind === ""' },
        properties: { empty: { type: 'boolean', default: true } } },
    ] }, input: { kind: -0 }, writes: [1, '1', NaN, undefined, null, false, ''].map(value => ({ path: '/kind', value })) },
  { name: 'same-name different-kind entries and conditional read key use fallback',
    schema: { type: 'object', properties: { on: { type: 'boolean' } }, anyOf: [
      { controls: { active: './on === true' }, properties: { kind: { type: 'string', default: 'a' } } },
      { controls: { active: './on === false' }, properties: { kind: { type: 'number', default: 0 } } },
      { controls: { active: "./kind === 'a'" }, properties: { payload: { type: 'string', default: 'P' } } },
    ] }, input: { on: true }, writes: [{ path: '/on', value: false }, { path: '/on', value: true }] },
  { name: 'branch-only discriminator key copy and empty bucket reentry',
    schema: { type: 'object', controls: { discriminator: 'kind' }, oneOf: [
      { properties: { kind: { type: 'string', const: 'a' }, a: { type: 'string', default: 'A' } } },
      { properties: { kind: { type: 'string', const: 'b' }, b: { type: 'string', default: 'B' } } },
    ] }, input: { kind: 'a' }, writes: [{ path: '/kind', value: 'b' }, { path: '/kind', value: '?' }, { path: '/kind', value: 'a' }] },
  { name: 'discriminator intersected values, negative zero and null schema branch',
    schema: { type: ['object', 'null'], controls: { discriminator: 'kind' }, properties: { kind: { type: 'number' } }, oneOf: [
      { allOf: [{ properties: { kind: { enum: [-0, 1] } } }, { properties: { kind: { const: 0 } } }],
        properties: { payload: { type: 'string', default: 'P' } } }, { type: 'null' },
    ] }, input: { kind: -0 }, writes: [{ path: '/kind', value: NaN }, { path: '/kind', value: 0 }, { value: null }, { value: { kind: -0 } }] },
  { name: 'FRAGMENT048 false front short circuits a throwing rear and preserves exits',
    schema: { type: 'object', controls: { discriminator: 'kind' }, properties: { kind: { type: 'string' } },
      oneOf: [{ controls: { active: '@.gate()' }, properties: {
        kind: { const: 'a', type: 'string' }, payload: { type: 'string', default: 'P', controls: { unsetOnInactive: true } },
      } }] }, input: { kind: 'no' }, writes: [
      { value: { kind: 'a' }, context: { gate: () => true } },
      { value: { kind: 'a' }, context: { gate: () => { throw new Error('rear'); } } },
      { value: { kind: 'no' }, context: { gate: () => { throw new Error('unreachable'); } } },
    ] },
  { name: 'pending throwing exit followed by derived discriminator transition',
    schema: { type: 'object', controls: { discriminator: 'kind' }, properties: {
      kind: { type: 'string', controls: { derived: '../source' } }, source: { type: 'string' },
    }, oneOf: [{ controls: { active: '@.gate()' }, properties: {
      kind: { type: 'string', const: 'a' }, payload: { type: 'string', default: 'P', controls: { unsetOnInactive: true } },
    } }] }, input: { kind: 'a', source: 'a' }, writes: [
      { value: { source: 'b' }, merge: true, context: { gate: () => { throw new Error('rear'); } } },
    ] },
  { name: 'overlay omitEmpty and root host schema changes without key raw changes',
    schema: { type: 'object', properties: { kind: { type: 'string' }, flag: { type: 'boolean' } }, allOf: [
      { controls: { active: './flag === true' }, options: { omitEmpty: true }, properties: { kind: { options: { omitEmpty: true } } } },
      { controls: { active: "./kind === ''" }, properties: { payload: { type: 'string', default: 'P' } } },
    ] }, input: { kind: '', flag: false }, writes: [{ path: '/flag', value: true }, { path: '/flag', value: false }] },
  { name: 'same-wheel default and derived key changes are visible at original sites',
    schema: { type: 'object', properties: {
      source: { type: 'string', default: 'b' }, kind: { type: 'string', default: 'a', controls: { derived: '../source' } },
    }, anyOf: ['a', 'b'].map(kind => ({ controls: { active: `./kind === '${kind}'` },
      properties: { [kind]: { type: 'string', default: kind } } })),
    }, input: {}, writes: [{ path: '/source', value: 'a' }, { path: '/source', value: 'b' }] },
  { name: 'two shared hosts, array occurrences and replacement reindexing',
    schema: { type: 'object', $defs: { host: { type: 'object', properties: { kind: { type: 'string' } },
      anyOf: [{ controls: { active: "./kind === 'a'" }, properties: { a: { type: 'string', default: 'A' } } }],
    } }, properties: { p: { $ref: '#/$defs/host' }, q: { $ref: '#/$defs/host' },
      list: { type: 'array', items: { $ref: '#/$defs/host' } } } },
    input: { p: { kind: 'a' }, q: { kind: 'b' }, list: [{ kind: 'a' }, { kind: 'b' }] },
    writes: [{ path: '/q/kind', value: 'a' }, { path: '/list', value: [{ kind: 'b' }, { kind: 'a' }] },
      { value: { p: { kind: 'b' }, q: { kind: 'a' }, list: [{ kind: 'a' }] } }] },
  { name: 'wrong-kind ancestors, hidden extras and current host identity replacement',
    schema: { type: 'object', properties: { host: { type: 'object', properties: { kind: { type: 'string', default: 'a' } },
      anyOf: [{ controls: { active: "./kind === 'a'" }, properties: { payload: { type: 'string', default: 'P' } } }] } } },
    input: { host: null }, writes: [{ value: { host: { kind: 'a', extra: true } }, merge: true },
      { value: { host: { kind: 'a' } } }, { path: '/host', value: null }, { path: '/host', value: { kind: 'a' } }] },
  { name: 'unrecognized loose equality, context, dynamic calls and literal dependency text',
    schema: { type: 'object', properties: { kind: { type: 'string' }, x: { type: 'string' } }, anyOf: [
      { controls: { active: "./kind == 'a'" }, properties: { a: { type: 'string', default: 'A' } } },
      { controls: { active: "./kind === 'a ./x '" }, properties: { b: { type: 'string', default: 'B' } } },
      { controls: { active: "@.gate() && ./kind === 'a'" }, properties: { c: { type: 'string', default: 'C' } } },
    ] }, input: { kind: 'a', x: 'X' }, writes: [{ path: '/kind', value: 'b' }, { path: '/kind', value: 'a' }] },
  { name: 'relocated absolute reads retain host wheel cap and late registration',
    schema: { type: 'object', properties: { p: { type: 'object', properties: {
      child: { type: 'string', default: 'P', controls: { active: '#/kind === 0' } },
    } }, kind: { type: 'number' } } }, input: { p: {}, kind: 1 },
    writes: [{ path: '/kind', value: 0 }, { path: '/kind', value: 1 }] },
  { name: 'finite recursive occurrence isolation',
    schema: { $defs: { host: { type: 'object', properties: { kind: { type: 'string' },
      next: { $ref: '#/$defs/host', controls: { active: "../kind === 'a'" } } }, anyOf: [{ controls: { active: "./kind === 'a'" },
        properties: { payload: { type: 'string', default: 'P' } } }] } }, $ref: '#/$defs/host' },
    input: { kind: 'a', next: { kind: 'b' } }, writes: [{ path: '/next/kind', value: 'b' },
      { value: { kind: 'b', next: { kind: 'a', next: { kind: 'b' } } } }] },
];
