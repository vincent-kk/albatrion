import { describe, expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  isArrayNode,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

const create = (jsonSchema: AuthoredSchema, defaultValue: object) =>
  mountEngineForm({
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

  it.each(['../wrap/group', 'constituents'] as const)(
    'retains a write to a group whose own owner is inactive (%s)',
    (target) => {
      const root = create(
        {
          type: 'object',
          properties: {
            wrapOn: { type: 'boolean' },
            src: {
              type: 'string',
              controls: {
                injectTo: (value: unknown) =>
                  typeof value !== 'string'
                    ? {}
                    : target === 'constituents'
                      ? { '../wrap/a': value + '_a', '../wrap/b': value + '_b' }
                      : { [target]: [value + '_a', value + '_b'] },
              },
            },
            wrap: {
              type: 'object',
              controls: { active: '../wrapOn === true' },
              properties: { a: { type: 'string' }, b: { type: 'string' } },
              options: { virtual: { group: { fields: ['a', 'b'] } } },
            },
          },
        },
        { wrapOn: false },
      );
      root.find('/src')!.setValue('s1');
      const retained = root.inactiveValues.map(({ path, value }) => ({
        path,
        value,
      }));
      root.find('/wrapOn')!.setValue(true);
      expect({ retained, opened: root.value }).toEqual({
        retained: [
          { path: '/wrap/a', value: 's1_a' },
          { path: '/wrap/b', value: 's1_b' },
        ],
        opened: { wrapOn: true, src: 's1', wrap: { a: 's1_a', b: 's1_b' } },
      });
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

describe('a virtual group lifetime leaves the state counts of its constituents alone', () => {
  /** The same fields with and without a group over them; the group must not change any count. */
  const schema = (grouped: boolean): AuthoredSchema => ({
    type: 'object',
    properties: {
      groupOn: { type: 'boolean' },
      aOn: { type: 'boolean' },
      a: { type: 'string', controls: { active: '../aOn === true' } },
      b: { type: 'string' },
      list: {
        type: 'array',
        items: {
          type: 'object',
          properties: { c: { type: 'string' }, d: { type: 'string' } },
          ...(grouped && {
            options: { virtual: { pair: { fields: ['c', 'd'] } } },
          }),
        },
      },
    },
    ...(grouped && {
      options: {
        virtual: {
          group: {
            fields: ['a', 'b'],
            controls: { active: '../groupOn === true' },
          },
        },
      },
    }),
  });

  /** Run one history and record the form-wide state after each step. */
  const observe = (grouped: boolean, steps: readonly string[]) => {
    const root = create(schema(grouped), {
      groupOn: true,
      aOn: true,
      list: [{ c: 'c0' }, { c: 'c1' }],
    });
    return steps.map((step) => {
      const [verb, path] = step.split(' ');
      try {
        if (verb === 'touch') root.find(path)!.setState({ touched: true });
        else if (verb === 'clear') root.find(path)!.clearSubtreeState();
        else if (verb === 'on') root.find(path)!.setValue(true);
        else if (verb === 'off') root.find(path)!.setValue(false);
        else if (verb === 'remove') {
          const list = root.find('/list');
          if (isArrayNode(list)) list.remove(Number(path));
        }
        return root.globalState;
      } catch (error) {
        return String(error);
      }
    });
  };

  it.each([
    [['touch /a', 'off /groupOn', 'clear /a', 'on /groupOn']],
    [['touch /b', 'off /groupOn', 'on /groupOn', 'off /groupOn', 'clear /b']],
    [['touch /a', 'off /aOn', 'on /aOn', 'touch /a', 'clear /a']],
    [['touch /list/0/c', 'remove 0', 'touch /list/0/c', 'clear /list/0/c']],
    [['touch /list/1/d', 'remove 0', 'clear /list/0/d']],
  ])('%j', (steps) => {
    expect(observe(true, steps)).toEqual(observe(false, steps));
  });
});

it('keeps every source on a batched same-tuple write after a constituent was cleared', () => {
  const observe = (batched: boolean) => {
    const root = create(
      {
        type: 'object',
        properties: {
          yOn: { type: 'boolean' },
          other: { type: 'boolean' },
          object: {
            type: 'object',
            properties: {
              x: { type: 'string' },
              y: { type: 'string', controls: { active: '/yOn === true' } },
            },
          },
        },
        options: { virtual: { group: { fields: ['object'] } } },
      },
      { yOn: true, object: { x: 'x0' } },
    );
    const group = root.find('/group')!;
    group.setValue([undefined]);
    root.find('/object/y')!.setValue('y7');
    root.find('/yOn')!.setValue(false);
    const write = () => {
      root.find('/other')!.setValue(true);
      group.setValue(group.value);
    };
    if (batched) root.batch(write);
    else write();
    return root.inactiveValues.map(({ path, value }) => ({ path, value }));
  };
  expect(observe(true)).toEqual(observe(false));
});

it.each([
  ['names the leaving constituent', ['injected', 'b1']],
  ['omits the leaving constituent', [undefined, 'b1']],
])(
  'a declarative group write that %s in the settlement its gate closes equals the write after the exit',
  (_, tuple) => {
    const observe = (batched: boolean) => {
      const root = create(
        {
          type: 'object',
          properties: {
            aOn: { type: 'boolean' },
            a: { type: 'string', controls: { active: '/aOn === true' } },
            b: { type: 'string' },
            source: {
              type: 'string',
              controls: {
                injectTo: (value: unknown) => {
                  const decoded: unknown =
                    typeof value === 'string' ? JSON.parse(value) : undefined;
                  return Array.isArray(decoded)
                    ? { '../group': decoded.map((slot) => slot ?? undefined) }
                    : {};
                },
              },
            },
          },
          options: { virtual: { group: { fields: ['a', 'b'] } } },
        },
        { aOn: true, a: 'a0', b: 'b0' },
      );
      const write = () => {
        root.find('/aOn')!.setValue(false);
        root.find('/source')!.setValue(JSON.stringify(tuple));
      };
      if (batched) root.batch(write);
      else write();
      return {
        value: root.value,
        retained: root.inactiveValues.map(({ path, value }) => ({
          path,
          value,
        })),
      };
    };
    expect(observe(true)).toEqual(observe(false));
  },
);

it('resetting a virtual group with an array constituent agrees with resetting the array (virtual storage contract)', () => {
  const schema: AuthoredSchema = {
    type: 'object',
    options: { virtual: { g: { fields: ['a'] } } },
    properties: {
      on: { type: 'boolean' },
      a: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            x: { type: 'string' },
            y: { type: 'string', controls: { active: '/on === true' } },
          },
          options: { virtual: { inner: { fields: ['x', 'y'] } } },
        },
      },
    },
  };
  const observe = (path: '/g' | '/a') => {
    const root = create(schema, { on: true, a: [{ x: 'x' }] });
    root.find('/a/0/y')!.setValue('edit');
    root.find('/on')!.setValue(false);
    root.find(path)!.resetSubtree();
    root.find('/on')!.setValue(true);
    expect(root.find('/a/0/y')!.value).toBeUndefined();
    return root.value;
  };
  expect(observe('/g')).toEqual(observe('/a'));
});

it('a detached virtual group reset preserves the committed read and pending caller write (EVENT-013)', () => {
  const root = create(
    {
      type: 'object',
      properties: { on: { type: 'boolean' }, a: { type: 'string' } },
      options: {
        virtual: { g: { fields: ['a'], controls: { active: '/on === true' } } },
      },
    },
    { on: true, a: 'old' },
  );
  const group = root.find('/g')!;
  const field = root.find('/a')!;
  root.find('/on')!.setValue(false);
  field.setValue('new');
  root.batch(() => {
    field.setValue('pending');
    group.resetSubtree();
    expect(field.value).toBe('new');
  });
  expect(field.value).toBe('pending');
});

it('nested gate departures count a constituent like the same ungrouped field (virtual state contract)', () => {
  const observe = (grouped: boolean) => {
    const root = create(
      {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          box: {
            type: 'object',
            controls: { active: '/boxOn === true' },
            properties: {
              x: { type: 'string', controls: { active: '/on === true' } },
              y: { type: 'string' },
            },
            ...(grouped
              ? {
                  options: {
                    virtual: {
                      g: {
                        fields: ['x', 'y'],
                        controls: { active: '/groupOn === true' },
                      },
                    },
                  },
                }
              : {}),
          },
          boxOn: { type: 'boolean' },
          groupOn: { type: 'boolean' },
        },
      },
      { on: true, boxOn: true, groupOn: true, box: { x: 'x', y: 'y' } },
    );
    root.find('/box/x')!.setState({ touched: true });
    return [
      root.globalState,
      ...['/groupOn', '/on', '/boxOn'].map((gate) => {
        root.find(gate)!.setValue(false);
        return root.globalState;
      }),
    ];
  };
  expect(observe(true)).toEqual(observe(false));
});
