import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Write DETAIL EVENT-013: a subtree reset whose barrier settlement detaches its scope is refused and
 * keeps its in-scope marks, except the addresses a later out-of-scope mark covers. An in-scope whole
 * write of /o is followed by a Merge that closes /o's gate and names only /o/x, then /o is reset:
 * the Merge covers x and the whole write keeps y, as one Merge of the same final caller value does.
 */

const SCHEMA: AuthoredSchema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    },
  },
};

type Root = ReturnType<typeof nodeFromJSONSchema>;

const retained = (write: (root: Root) => void) => {
  const root = nodeFromJSONSchema({
    jsonSchema: SCHEMA,
    defaultValue: { on: true, o: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  write(root);
  return Object.fromEntries(
    root.inactiveValues.map(({ path, value }) => [path, value]),
  );
};

const calls = (root: Root) => {
  const o = root.find('/o')!;
  o.setValue({ x: 'earlyX', y: 'earlyY' });
  root.setValue({ on: false, o: { x: 'lateX' } }, WriteOption.Merge);
  o.resetSubtree();
};

const EXPECTED = { '/o/x': 'lateX', '/o/y': 'earlyY' };

it('a refused reset keeps the part of an earlier whole mark a later Merge does not name', () => {
  expect(retained((root) => root.batch(() => calls(root)))).toEqual(EXPECTED);
  expect(
    retained((root) => root.batch(() => root.batch(() => calls(root)))),
  ).toEqual(EXPECTED);
});

it('a refused reset reuses the value read from a later Merge getter', () => {
  let reads = 0;
  expect(
    retained((root) =>
      root.batch(() => {
        const o = root.find('/o')!;
        o.setValue({ x: 'earlyX', y: 'earlyY' });
        root.setValue(
          {
            on: false,
            o: {
              get x() {
                return `late${++reads}`;
              },
            },
          },
          WriteOption.Merge,
        );
        o.resetSubtree();
      }),
    ),
  ).toEqual({ '/o/x': 'late1', '/o/y': 'earlyY' });
  expect(reads).toBe(1);
});

it('one Merge of the same final caller value leaves the same retained sources', () => {
  expect(
    retained((root) =>
      root.setValue(
        { on: false, o: { x: 'lateX', y: 'earlyY' } },
        WriteOption.Merge,
      ),
    ),
  ).toEqual(EXPECTED);
});

it('a refused reset keeps earlier values when the later Merge omits their container', () => {
  expect(
    retained((root) =>
      root.batch(() => {
        const o = root.find('/o')!;
        o.setValue({ x: 'earlyX', y: 'earlyY' });
        root.setValue({ on: false }, WriteOption.Merge);
        o.resetSubtree();
      }),
    ),
  ).toEqual({ '/o/x': 'earlyX', '/o/y': 'earlyY' });
});

it.each([
  ['batch', 1],
  ['nested batch', 1],
  ['batch', 2],
  ['nested batch', 2],
  ['sequence', 1],
  ['one Merge', 1],
] as const)(
  'a refused reset in %s reads the keys in a later virtual Merge with %i constituent(s) (EVENT-013 and equivalent Merge)',
  (mode, constituentCount) => {
    const jsonSchema: AuthoredSchema = {
      type: 'object',
      options: {
        virtual: {
          group: { fields: constituentCount === 1 ? ['o'] : ['o', 'peer'] },
        },
      },
      properties: {
        on: { type: 'boolean' },
        peer: { type: 'string' },
        o: {
          type: 'object',
          properties: {
            n: {
              type: 'object',
              controls: { active: '/on === true' },
              properties: { x: { type: 'string' }, y: { type: 'string' } },
            },
          },
        },
      },
    };
    const root = nodeFromJSONSchema({
      jsonSchema,
      defaultValue: { on: true, peer: 'peer0', o: { n: { x: 'x0', y: 'y0' } } },
      validationMode: ValidationMode.None,
    });
    const write = () => {
      const n = root.find('/o/n')!;
      const o = { n: { x: 'lateX' } };
      n.setValue({ x: 'earlyX', y: 'earlyY' });
      root
        .find('/group')!
        .setValue(
          constituentCount === 1 ? [o] : [o, 'latePeer'],
          WriteOption.Merge,
        );
      root.find('/on')!.setValue(false);
      n.resetSubtree();
    };
    if (mode === 'sequence') write();
    else if (mode === 'one Merge')
      root.setValue(
        { on: false, o: { n: { x: 'lateX', y: 'earlyY' } } },
        WriteOption.Merge,
      );
    else root.batch(mode === 'batch' ? write : () => root.batch(write));
    expect(
      Object.fromEntries(
        root.inactiveValues.map(({ path, value }) => [path, value]),
      ),
    ).toEqual({ '/o/n/x': 'lateX', '/o/n/y': 'earlyY' });
  },
);

const EARLY = {
  n: { x: 'earlyX', y: 'earlyY' },
  a: ['earlyA', 'earlyB'],
  z: 'earlyZ',
};

it.each([
  {
    name: 'nested key',
    later: { on: false, o: { n: { x: 'lateX' } } },
    combined: { on: false, o: { ...EARLY, n: { x: 'lateX', y: 'earlyY' } } },
    option: WriteOption.Merge,
  },
  {
    name: 'array replacement',
    later: { on: false, o: { a: ['lateA'] } },
    combined: { on: false, o: { ...EARLY, a: ['lateA'] } },
    option: WriteOption.Merge,
  },
  {
    name: 'whole scope',
    later: {
      on: false,
      o: { n: { x: 'lateX', y: 'lateY' }, a: ['lateA'], z: 'lateZ' },
    },
    combined: {
      on: false,
      o: { n: { x: 'lateX', y: 'lateY' }, a: ['lateA'], z: 'lateZ' },
    },
    option: WriteOption.Merge,
  },
  {
    name: 'no overlap',
    later: { on: false, other: 'last' },
    combined: { on: false, other: 'last', o: EARLY },
    option: WriteOption.Merge,
  },
  {
    name: 'overwrite',
    later: { on: false, o: { n: { x: 'lateX' } } },
    combined: {
      on: false,
      other: undefined,
      o: { n: { x: 'lateX', y: undefined }, a: undefined, z: undefined },
    },
    option: WriteOption.Overwrite,
  },
] as const)(
  'a refused reset with $name matches one Merge of the final caller values (EVENT-013)',
  ({ later, combined, option }) => {
    const jsonSchema: AuthoredSchema = {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        other: { type: 'string' },
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: {
            n: {
              type: 'object',
              properties: { x: { type: 'string' }, y: { type: 'string' } },
            },
            a: { type: 'array', items: { type: 'string' } },
            z: { type: 'string' },
          },
        },
      },
    };
    const observe = (write: (root: Root) => void) => {
      const root = nodeFromJSONSchema({
        jsonSchema,
        defaultValue: {
          on: true,
          other: 'v',
          o: { n: { x: 'x0', y: 'y0' }, a: ['a0', 'b0'], z: 'z0' },
        },
        validationMode: ValidationMode.None,
      });
      write(root);
      return {
        value: root.value,
        retained: Object.fromEntries(
          root.inactiveValues.map(({ path, value }) => [path, value]),
        ),
      };
    };
    const expected = observe((root) =>
      root.setValue(combined, WriteOption.Merge),
    );
    for (const mode of ['batch', 'nested batch', 'sequence'] as const)
      for (const resets of [1, 2])
        expect(
          observe((root) => {
            const object = root.find('/o')!;
            const write = () => {
              object.setValue(EARLY);
              root.setValue(later, option);
              for (let reset = 0; reset < resets; reset++)
                object.resetSubtree();
            };
            if (mode === 'sequence') write();
            else if (mode === 'batch') root.batch(write);
            else root.batch(() => root.batch(write));
          }),
          `${mode}, ${resets} reset(s)`,
        ).toEqual(expected);
  },
);
