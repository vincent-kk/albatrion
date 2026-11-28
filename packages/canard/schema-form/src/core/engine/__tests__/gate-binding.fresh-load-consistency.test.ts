import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { type ArrayNode, isArrayNode } from '../../surface';
import { ValidationMode } from '../types/state';

/*
 * Deep gate scenes and array scenes whose items move in the settlement of a gate flip. Every
 * scene compares the live form with a fresh load.
 */

const validator = createTestValidator();

type ProbeRoot = ReturnType<typeof nodeFromJSONSchema>;

const mount = (
  schema: object,
  value: unknown,
  context?: Record<string, unknown>,
): ProbeRoot =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: value,
    validationMode: ValidationMode.None,
    validator,
    context,
  });

const schemaAt = (root: ProbeRoot, path: string): string => {
  const node = root.find(path);
  return node ? JSON.stringify(node.jsonSchema) : 'absent';
};

const show = (root: ProbeRoot, path: string): string => {
  const node = root.find(path);
  if (!node) return 'absent';
  const value = node.value;
  return value === undefined ? 'undefined' : JSON.stringify(value);
};

const againstFresh = (
  schema: object,
  root: ProbeRoot,
  paths: readonly string[],
) => {
  const fresh = mount(schema, JSON.parse(JSON.stringify(root.value ?? null)));
  const describe = (form: ProbeRoot) =>
    paths.map((path) => `${path}=${show(form, path)} ${schemaAt(form, path)}`);
  return [describe(root), describe(fresh)] as const;
};

const recursive = {
  type: 'object',
  $defs: {
    node: {
      type: 'object',
      properties: {
        k: { type: 'string' },
        v: { type: 'string' },
        kids: { type: 'array', items: { $ref: '#/$defs/node' } },
      },
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          kids: { items: { properties: { v: { minLength: 1 } } } },
        },
      },
    },
  },
  properties: { tree: { $ref: '#/$defs/node' } },
};
const relocatedAtChild = {
  type: 'object',
  properties: {
    k: { type: 'string' },
    obj: {
      type: 'object',
      properties: { list: { type: 'array', items: { type: 'string' } } },
      allOf: [
        {
          controls: { active: '../k === "1"' },
          properties: { list: { items: { minLength: 1 } } },
        },
      ],
    },
  },
};
const twoHosts = {
  type: 'object',
  properties: {
    k: { type: 'string' },
    obj: {
      type: 'object',
      properties: {
        j: { type: 'string' },
        list: { type: 'array', items: { type: 'string' } },
      },
      if: { properties: { j: { const: '1' } }, required: ['j'] },
      then: { properties: { list: { items: { maxLength: 5 } } } },
    },
  },
  allOf: [
    {
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          obj: { properties: { list: { items: { minLength: 1 } } } },
        },
      },
    },
  ],
};
const discriminated = {
  type: 'object',
  controls: { discriminator: 'k' },
  properties: {
    k: { type: 'string', enum: ['1', '2'] },
    obj: {
      type: 'object',
      properties: { list: { type: 'array', items: { type: 'string' } } },
    },
  },
  oneOf: [
    {
      properties: {
        k: { const: '1' },
        obj: { properties: { list: { items: { minLength: 1 } } } },
      },
    },
    {
      properties: {
        k: { const: '2' },
        obj: { properties: { list: { items: { maxLength: 3 } } } },
      },
    },
  ],
};
const deepPresence = {
  type: 'object',
  properties: {
    k: { type: 'string' },
    obj: {
      type: 'object',
      properties: { inner: { type: 'object', properties: {} } },
    },
  },
  allOf: [
    {
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          obj: {
            properties: {
              inner: {
                properties: { extra: { type: 'string', default: 'x' } },
              },
            },
          },
        },
      },
    },
  ],
};
const throwingAtDepth = {
  type: 'object',
  properties: {
    k: { type: 'string' },
    obj: {
      type: 'object',
      properties: { list: { type: 'array', items: { type: 'string' } } },
      allOf: [
        {
          controls: { active: '@.gate(../k)' },
          properties: { list: { items: { minLength: 1 } } },
        },
      ],
    },
  },
  allOf: [
    {
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          obj: { properties: { list: { items: { maxLength: 4 } } } },
        },
      },
    },
  ],
};

describe('deep-gate scenes agree with a fresh load', () => {
  it('recursive template at depth 1 and 2', () => {
    const root = mount(recursive, {
      tree: { k: '0', kids: [{ k: '1', kids: [{ v: 'a' }] }] },
    });
    const paths = [
      '/tree/kids/0',
      '/tree/kids/0/kids/0',
      '/tree/kids/0/kids/0/v',
    ];
    root.find('/tree/kids/0/k')?.setValue('0');
    const [off, freshOff] = againstFresh(recursive, root, paths);
    expect(off).toEqual(freshOff);
    root.find('/tree/kids/0/k')?.setValue('1');
    const [on, freshOn] = againstFresh(recursive, root, paths);
    expect(on).toEqual(freshOn);
  });

  it('relocated active gate hosted at the child', () => {
    const root = mount(relocatedAtChild, { k: '1', obj: { list: ['a', 'b'] } });
    expect(schemaAt(root, '/obj/list/0')).toBe(
      '{"minLength":1,"type":"string"}',
    );
    const paths = ['/obj/list', '/obj/list/0', '/obj/list/1'];
    root.find('/k')?.setValue('0');
    const [off, freshOff] = againstFresh(relocatedAtChild, root, paths);
    expect(off).toEqual(freshOff);
    root.find('/k')?.setValue('1');
    const [on, freshOn] = againstFresh(relocatedAtChild, root, paths);
    expect(on).toEqual(freshOn);
  });

  it('two hosting ancestors turned off one after the other and back', () => {
    const root = mount(twoHosts, { k: '1', obj: { j: '1', list: ['a'] } });
    const paths = ['/obj', '/obj/list', '/obj/list/0'];
    const steps: [string, unknown][] = [
      ['/k', '0'],
      ['/obj/j', '0'],
      ['/k', '1'],
      ['/obj/j', '1'],
    ];
    for (const [path, value] of steps) {
      root.find(path)?.setValue(value);
      const [live, fresh] = againstFresh(twoHosts, root, paths);
      expect(live, `${path}=${String(value)}`).toEqual(fresh);
    }
  });

  it('discriminator A to B and back, both branches reaching deep', () => {
    const root = mount(discriminated, { k: '1', obj: { list: ['a'] } });
    for (const value of ['2', '1']) {
      root.find('/k')?.setValue(value);
      const [live, fresh] = againstFresh(discriminated, root, [
        '/obj',
        '/obj/list',
        '/obj/list/0',
      ]);
      expect(live, `k=${value}`).toEqual(fresh);
    }
  });

  it('deep presence exit compared with a fresh load', () => {
    const root = mount(deepPresence, { k: '1', obj: { inner: {} } });
    root.find('/k')?.setValue('0');
    const [live, fresh] = againstFresh(deepPresence, root, [
      '/obj',
      '/obj/inner',
      '/obj/inner/extra',
    ]);
    expect(live).toEqual(fresh);
    expect(JSON.stringify(root.value)).toBe(
      JSON.stringify(mount(deepPresence, { k: '0', obj: { inner: {} } }).value),
    );
  });

  it('a throwing gate at depth beside a root gate that turns off', () => {
    const context = {
      gate: (k: unknown) => {
        if (k === '0') throw new Error('gate');
        return k === '1';
      },
    };
    const root = mount(
      throwingAtDepth,
      { k: '1', obj: { list: ['a'] } },
      context,
    );
    let thrown = '';
    try {
      root.find('/k')?.setValue('0');
    } catch (error) {
      thrown = String(error);
    }
    expect(thrown).toContain('Gate evaluation failed');
    expect(schemaAt(root, '/obj/list/0')).not.toContain('maxLength');
  });
});

/** Items narrowed per item by their own `if`, and two levels below the root by the root `if`. */
const itemsSchema = {
  type: 'object',
  properties: {
    k: { type: 'string' },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { t: { type: 'string' }, v: { type: 'string' } },
        if: { properties: { t: { const: 'n' } }, required: ['t'] },
        then: { properties: { v: { minLength: 2 } } },
      },
    },
  },
  allOf: [
    {
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          list: { items: { properties: { v: { maxLength: 5 } } } },
        },
      },
    },
  ],
};
const n = { t: 'n', v: 'aa' };
const m = { t: 'm', v: 'b' };
const itemPaths = [
  '/list/0',
  '/list/0/v',
  '/list/1',
  '/list/1/v',
  '/list/2',
  '/list/2/v',
];

const writeTogether = (
  root: ProbeRoot,
  k: string,
  list: unknown[],
  whole: boolean,
) => {
  if (whole) root.setValue({ k, list });
  else
    root.batch(() => {
      root.find('/k')?.setValue(k);
      root.find('/list')?.setValue(list);
    });
};

/** The root gate reads the first item, so an insert or remove at the head flips it in the arrangement's own settlement. */
const headGateSchema = {
  ...itemsSchema,
  allOf: [
    {
      controls: { active: './list/0/t === "x"' },
      properties: { list: { items: { properties: { v: { maxLength: 5 } } } } },
    },
  ],
};
const x = { t: 'x', v: 'z' };

describe('child consistency: moved item nodes in the settlement of a gate flip', () => {
  it.each([
    [
      'insert at the head turns the gate on',
      [n, m, n],
      (list: ArrayNode) => list.insert(0, { ...x }),
      true,
    ],
    [
      'remove at the head turns the gate off',
      [x, n, m],
      (list: ArrayNode) => list.remove(0),
      false,
    ],
    [
      'insert at the head turns the gate off',
      [x, m, n],
      (list: ArrayNode) => list.insert(0, { ...m }),
      false,
    ],
    [
      'remove at the head turns the gate on',
      [n, x, m],
      (list: ArrayNode) => list.remove(0),
      true,
    ],
  ] as const)('%s', (_name, list0, arrange, isOn) => {
    const root = mount(headGateSchema, { list: [...list0] });
    const list = root.find('/list');
    if (!isArrayNode(list))
      throw new Error('the scene needs the array node at /list');
    arrange(list);
    const [live, fresh] = againstFresh(headGateSchema, root, [
      ...itemPaths,
      '/list/3',
      '/list/3/v',
    ]);
    expect(live.some((line) => line.includes('maxLength'))).toBe(isOn);
    expect(live).toEqual(fresh);
  });
});

describe.each([
  ['batch', false],
  ['whole write', true],
] as const)(
  'child consistency: array rearrangement in the settlement of a gate flip (%s)',
  (_, whole) => {
    it.each([
      ['reorder, gate off', '1', [n, m], '0', [m, n]],
      ['reorder, gate on', '0', [n, m], '1', [m, n]],
      ['replacement, gate off', '1', [n, m], '0', [{ t: 'n', v: 'cc' }]],
      ['replacement, gate on', '0', [m, m], '1', [n, n, m]],
      ['unshift, gate off', '1', [n, m], '0', [m, n, m]],
      ['unshift, gate on', '0', [n, m], '1', [m, n, m]],
    ] as const)('%s', (_name, k0, list0, k1, list1) => {
      const root = mount(itemsSchema, { k: k0, list: list0 });
      writeTogether(root, k1, [...list1], whole);
      const [live, fresh] = againstFresh(itemsSchema, root, itemPaths);
      expect(live).toEqual(fresh);
    });
  },
);
