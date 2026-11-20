import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';

const create = (jsonSchema: AuthoredSchema, defaultValue: object) =>
  nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    validationMode: ValidationMode.None,
  });

describe('a live virtual group reset resets each constituent at its own address', () => {
  const schema = {
    type: 'object',
    properties: {
      on: { type: 'boolean' },
      a: {
        type: 'object',
        properties: {
          x: { type: 'string' },
          y: { type: 'string', controls: { active: '/on === true' } },
        },
      },
      b: { type: 'string' },
    },
    options: { virtual: { group: { fields: ['a', 'b'] } } },
  } as const satisfies AuthoredSchema;

  /** Edit the constituents, gate y off, reset by one scope, then reactivate y. */
  const observe = (
    loaded: object,
    edit: boolean,
    on: boolean,
    scope: 'group' | 'constituents',
  ) => {
    const root = create(schema, { on: true, b: 'b0', ...loaded });
    if (edit) {
      root.find('/a/y')!.setValue('edited');
      root.find('/a/x')!.setValue('x1');
      root.find('/b')!.setValue('b1');
    }
    root.find('/on')!.setValue(on);
    if (scope === 'group') root.find('/group')!.resetSubtree();
    else for (const path of ['/a', '/b']) root.find(path)!.resetSubtree();
    const retained = root.inactiveValues.map(({ path, value }) => ({
      path,
      value,
    }));
    root.find('/on')!.setValue(true);
    return { retained, value: root.value };
  };

  it.each([
    [{ a: { x: 'x0' } }, true, false],
    [{ a: { x: 'x0' } }, true, true],
    [{ a: { x: 'x0', y: 'y0' } }, true, false],
    [{ a: { x: 'x0', y: 'y0' } }, false, false],
    [{}, true, false],
  ])('loaded %j, edited %s, y active %s', (loaded, edit, on) => {
    expect(observe(loaded, edit, on, 'group')).toEqual(
      observe(loaded, edit, on, 'constituents'),
    );
  });
});

describe('a declarative write to a virtual group distributes like the constituent writes', () => {
  type Writer = 'group injectTo' | 'group derived' | 'constituent injectTo';
  /** One schema whose rule writes the group by injectTo or derived, or each constituent by injectTo. */
  const schema = (writer: Writer): AuthoredSchema => ({
    type: 'object',
    properties: {
      bOn: { type: 'boolean' },
      groupOn: { type: 'boolean' },
      src: {
        type: 'string',
        ...(writer !== 'group derived' && {
          controls: {
            injectTo: (value: unknown) =>
              typeof value !== 'string'
                ? {}
                : writer === 'group injectTo'
                  ? { '../group': [value + '_a', value + '_b'] }
                  : { '../a': value + '_a', '../b': value + '_b' },
          },
        }),
      },
      a: { type: 'string' },
      b: { type: 'string', controls: { active: '../bOn === true' } },
    },
    options: {
      virtual: {
        group: {
          fields: ['a', 'b'],
          controls: {
            active: '../groupOn === true',
            ...(writer === 'group derived' && {
              derived:
                '../src === undefined ? [ undefined , undefined ] : [ ../src + "_a" , ../src + "_b" ]',
            }),
          },
        },
      },
    },
  });

  /** Write the source while the gates hold, then open both gates. */
  const observe = (writer: Writer, bOn: boolean, groupOn: boolean) => {
    const root = create(schema(writer), { bOn, groupOn });
    root.find('/src')!.setValue('s1');
    const retained = root.inactiveValues.map(({ path, value }) => ({
      path,
      value,
    }));
    const value = root.value;
    root.find('/bOn')!.setValue(true);
    root.find('/groupOn')!.setValue(true);
    return { retained, value, opened: root.value };
  };

  it.each([
    ['group injectTo', true, true],
    ['group injectTo', false, true],
    ['group injectTo', true, false],
    ['group injectTo', false, false],
    ['group derived', true, true],
    ['group derived', false, true],
  ] as const)(
    '%s with b active %s and group active %s',
    (writer, bOn, groupOn) => {
      expect(observe(writer, bOn, groupOn)).toEqual(
        observe('constituent injectTo', bOn, groupOn),
      );
    },
  );

  it('creates no source at the group address of an inactive group', () => {
    const root = create(schema('group injectTo'), {
      bOn: true,
      groupOn: false,
    });
    root.find('/src')!.setValue('s1');
    expect(root.inactiveValues).toEqual([]);
    expect(root.value).toEqual({
      bOn: true,
      groupOn: false,
      src: 's1',
      a: 's1_a',
      b: 's1_b',
    });
  });
});
