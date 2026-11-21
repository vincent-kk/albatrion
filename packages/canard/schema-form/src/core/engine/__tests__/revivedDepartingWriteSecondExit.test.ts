import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Target = 'own path' | 'parent object' | 'virtual group';
type Neighbor =
  | 'second revival'
  | 'higher rank'
  | 'nested address'
  | 'caller'
  | 'subtree reset'
  | 'live overwrite';
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue' | 'onInactive';

/** A source writes a fixed value when given a nonempty input. */
const inject = (target: string, value: unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) => (source ? { [target]: value } : {}),
  },
});

/** The first gate closes in caller compute, then two separate reactions reopen and close it. */
const createSchema = (
  target: Target,
  policy: Policy,
  neighbor?: Neighbor,
  extraProperties?: Record<string, AuthoredSchema>,
): AuthoredSchema => {
  const nested = neighbor === 'nested address';
  const address = nested ? '/o/n/y' : '/o/y';
  const object = nested ? { n: { y: 'new' } } : { y: 'new' };
  const leaf: AuthoredSchema = {
    type: 'string',
    controls:
      policy === 'unsetOnInactive'
        ? { unsetOnInactive: true }
        : policy === 'inactiveValue'
          ? { inactiveValue: 'resolved' }
          : {},
  };
  return {
    type: 'object',
    options: { virtual: { group: { fields: ['o'] } } },
    properties: {
      on: { type: 'boolean' },
      src:
        target === 'own path'
          ? inject('..' + address, 'new')
          : target === 'parent object'
            ? inject('../o', object)
            : inject('../group', [object]),
      o: {
        type: 'object',
        controls: { active: '/on === true' },
        properties: {
          ...(nested
            ? { n: { type: 'object' as const, properties: { y: leaf } } }
            : { y: leaf }),
          ...extraProperties,
        },
      },
      reopen: inject('../on', true),
      closeAgain: {
        type: 'string',
        controls: {
          derived: `${address} === "new" ? "closed" : /closeAgain`,
          injectTo: (value: unknown) =>
            value === 'closed'
              ? {
                  '../on': false,
                  ...(neighbor === 'live overwrite'
                    ? { '../o/y': 'latest' }
                    : {}),
                }
              : {},
        },
      },
      ...(neighbor === 'second revival' || neighbor === 'higher rank'
        ? {
            openAgain: {
              type: 'string',
              controls: {
                derived:
                  '/closeAgain === "closed" && /on === false ? "opened" : /openAgain',
                injectTo: (value: unknown) =>
                  value === 'opened' ? { '../on': true } : {},
              },
            },
          }
        : {}),
      ...(neighbor === 'higher rank'
        ? {
            late: {
              type: 'string',
              controls: {
                derived:
                  '/closeAgain === "closed" && /on === false ? "late" : /late',
                injectTo: (value: unknown) =>
                  value === 'late' ? { '../o/y': 'later' } : {},
              },
            },
          }
        : {}),
    },
  };
};

const CALLER_VALUES = { on: false, src: 's', reopen: 'r' };

/** Write the same caller values through the individual fields of the batch. */
const writeFields = (root: Root) => {
  for (const [key, value] of Object.entries(CALLER_VALUES))
    root.find('/' + key)!.setValue(value);
};

const FORMS = [
  [
    'one Merge',
    (root: Root) => root.setValue(CALLER_VALUES, WriteOption.Merge),
  ],
  ['batch', (root: Root) => root.batch(() => writeFields(root))],
  [
    'nested batch',
    (root: Root) => root.batch(() => root.batch(() => writeFields(root))),
  ],
] as const;

/** Observe the retained write, the gate, and any settlement diagnostics. */
const observe = (
  target: Target,
  policy: Policy,
  write: (root: Root) => void,
  neighbor?: Neighbor,
) => {
  const report = vi.fn();
  const resolver = vi.fn(() => 'resolved');
  const root = nodeFromJSONSchema({
    jsonSchema: createSchema(target, policy, neighbor),
    defaultValue: {
      on: true,
      o: neighbor === 'nested address' ? { n: { y: 'y0' } } : { y: 'y0' },
    },
    validationMode: ValidationMode.None,
    errorReporter: { hasConsumer: () => true, report },
  });
  if (policy === 'onInactive') {
    const address = neighbor === 'nested address' ? '/o/n/y' : '/o/y';
    root.find(address)!.onInactive(resolver);
  }
  write(root);
  return {
    on: root.find('/on')!.value,
    o: root.find('/o')?.value,
    closeAgain: root.find('/closeAgain')!.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
    resolverCalls: resolver.mock.calls.length,
    diagnostics: report.mock.calls,
  };
};

it.each(['default', 'unsetOnInactive', 'inactiveValue', 'onInactive'] as const)(
  'retains the revived declarative value on the second exit under %s',
  (policy) => {
    for (const [form, write] of FORMS) {
      const ownPath = observe('own path', policy, write);
      expect.soft(ownPath, `${form}, own path`).toEqual({
        on: false,
        o: undefined,
        closeAgain: 'closed',
        retained: { '/o/y': 'new' },
        resolverCalls: policy === 'onInactive' ? 1 : 0,
        diagnostics: [],
      });
      for (const target of ['parent object', 'virtual group'] as const)
        expect
          .soft(observe(target, policy, write), `${form}, ${target}`)
          .toEqual(ownPath);
    }
  },
);

it.each([
  ['second revival', true, { y: 'new' }, {}],
  ['higher rank', true, { y: 'later' }, {}],
  ['nested address', false, undefined, { '/o/n/y': 'new' }],
  ['caller', false, undefined, { '/o/y': 'new' }],
  ['subtree reset', false, undefined, { '/o/y': 'new' }],
  ['live overwrite', false, undefined, { '/o/y': 'latest' }],
] as const)(
  'keeps the same revived write when exercising %s',
  (neighbor, on, o, retained) => {
    const combined =
      neighbor === 'caller'
        ? { ...CALLER_VALUES, o: { y: 'caller' } }
        : CALLER_VALUES;
    const merge = (root: Root) => root.setValue(combined, WriteOption.Merge);
    const batch = (root: Root) =>
      root.batch(() => {
        const object = root.find('/o')!;
        writeFields(root);
        if (neighbor === 'caller') root.find('/o/y')!.setValue('caller');
        if (neighbor === 'subtree reset') object.resetSubtree();
      });
    const expected = observe('own path', 'default', merge, neighbor);
    expect(expected).toEqual({
      on,
      o,
      closeAgain: 'closed',
      retained,
      resolverCalls: 0,
      diagnostics: [],
    });
    for (const target of [
      'own path',
      'parent object',
      'virtual group',
    ] as const) {
      expect
        .soft(
          observe(target, 'default', merge, neighbor),
          `one Merge, ${target}`,
        )
        .toEqual(expected);
      expect
        .soft(observe(target, 'default', batch, neighbor), `batch, ${target}`)
        .toEqual(expected);
      expect
        .soft(
          observe(
            target,
            'default',
            (root) => root.batch(() => batch(root)),
            neighbor,
          ),
          `nested batch, ${target}`,
        )
        .toEqual(expected);
    }
  },
);

it('lets the exit policy decide a value replaced by a later live write', () => {
  for (const [form, write] of FORMS)
    for (const target of [
      'own path',
      'parent object',
      'virtual group',
    ] as const)
      expect(
        observe(target, 'inactiveValue', write, 'live overwrite'),
        `${form}, ${target}`,
      ).toEqual({
        on: false,
        o: undefined,
        closeAgain: 'closed',
        retained: { '/o/y': 'resolved' },
        resolverCalls: 0,
        diagnostics: [],
      });
});

it.each([
  'second revival',
  'higher rank',
  'nested address',
  'caller',
  'subtree reset',
  'live overwrite',
] as const)(
  'matches the own-path write through %s under exit policies (WRITE-079)',
  (neighbor) => {
    for (const policy of [
      'unsetOnInactive',
      'inactiveValue',
      'onInactive',
    ] as const) {
      const combined =
        neighbor === 'caller'
          ? { ...CALLER_VALUES, o: { y: 'caller' } }
          : CALLER_VALUES;
      const merge = (root: Root) => root.setValue(combined, WriteOption.Merge);
      const batch = (root: Root) =>
        root.batch(() => {
          const object = root.find('/o')!;
          writeFields(root);
          if (neighbor === 'caller') root.find('/o/y')!.setValue('caller');
          if (neighbor === 'subtree reset') object.resetSubtree();
        });
      const expected = observe('own path', policy, merge, neighbor);
      expect(expected.diagnostics).toEqual([]);
      for (const target of [
        'own path',
        'parent object',
        'virtual group',
      ] as const) {
        for (const [form, write] of [
          ['Merge', merge],
          ['batch', batch],
          ['nested batch', (root: Root) => root.batch(() => batch(root))],
        ] as const)
          expect(
            observe(target, policy, write, neighbor),
            `${policy}, ${target}, ${form}`,
          ).toEqual(expected);
      }
    }
  },
);

it.each(['leaf', 'container'] as const)(
  'withdraws an unnamed %s default filled during revival (SETTLE-005)',
  (kind) => {
    for (const target of [
      'own path',
      'parent object',
      'virtual group',
    ] as const)
      for (const policy of [
        'default',
        'unsetOnInactive',
        'inactiveValue',
        'onInactive',
      ] as const)
        for (const [form, write] of FORMS) {
          const controls = { active: '/on === true && /src === "s"' };
          const z: AuthoredSchema =
            kind === 'container'
              ? {
                  type: 'object',
                  default: { x: 'D' },
                  controls,
                  properties: { x: { type: 'string' } },
                }
              : { type: 'string', default: 'D', controls };
          const root = nodeFromJSONSchema({
            jsonSchema: createSchema(target, policy, undefined, { z }),
            defaultValue: { on: true, o: { y: 'y0' } },
            validationMode: ValidationMode.None,
          });
          if (policy === 'onInactive')
            root.find('/o/y')!.onInactive(() => 'resolved');
          write(root);
          expect(root.inactiveValues, `${target}, ${policy}, ${form}`).toEqual([
            { path: '/o/y', value: 'new' },
          ]);
        }
  },
);

it.each(['default', 'unsetOnInactive', 'inactiveValue', 'onInactive'] as const)(
  'rolls back unlatched automatic writes when the cycle exhausts the budget (SETTLE-011, %s)',
  (policy) => {
    for (const target of [
      'own path',
      'parent object',
      'virtual group',
    ] as const)
      for (const [form, write] of FORMS) {
        const schema = createSchema(target, policy);
        schema.properties!.reopen!.controls!.derived =
          '/on === false ? "r" : ""';
        schema.properties!.closeAgain!.controls!.derived =
          '/o/y === "new" ? "closed" : ""';
        const report = vi.fn();
        const root = nodeFromJSONSchema({
          jsonSchema: schema,
          defaultValue: { on: true, o: { y: 'y0' } },
          validationMode: ValidationMode.None,
          errorReporter: { hasConsumer: () => true, report },
        });
        if (policy === 'onInactive')
          root.find('/o/y')!.onInactive(() => 'resolved');
        const message = `${target}, ${form}`;
        let thrown: unknown;
        try {
          write(root);
        } catch (error) {
          thrown = error;
        }
        expect(
          [thrown, ...report.mock.calls.flat()].map(String).join(' '),
          message,
        ).toMatch(/budget|derive/i);
        expect(root.inactiveValues, message).toEqual([
          { path: '/o/y', value: 'y0' },
        ]);
        expect(root.find('/on')!.value, message).toBe(false);
      }
  },
);
