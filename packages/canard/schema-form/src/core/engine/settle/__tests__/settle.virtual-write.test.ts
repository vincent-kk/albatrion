import { describe, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { SchemaFormError } from '@/schema-form/errors';

import { getGateRegistry } from '../utils/gates/getGateRegistry';

/** Records the host kind and path of every child creation, including settlement's own callers. */
const createdUnder = vi.hoisted(() => vi.fn());

vi.mock('../utils/compute/createChildNode', async (importOriginal) => {
  const original = await importOriginal<{
    createChildNode: (
      host: { behavior: { type: string }; path: string },
      entry: unknown,
    ) => unknown;
  }>();
  return {
    ...original,
    createChildNode: (
      host: { behavior: { type: string }; path: string },
      entry: unknown,
    ) => {
      createdUnder(host.behavior.type, host.path);
      return original.createChildNode(host, entry);
    },
  };
});

/**
 * Read the hosts of child creations made by virtual groups since the last clear.
 * @returns Paths of virtual hosts that created a child, one per creation
 */
const virtualCreations = () =>
  createdUnder.mock.calls
    .filter(([type]) => type === 'virtual')
    .map(([, path]) => path);

/**
 * Build an object whose constituent `data` is narrowed while `flag` is true and grouped with `y` under `pair`.
 * @param group - Extra keys of the virtual group `pair`
 * @returns Authored object schema
 */
const narrowedPairSchema = (group: object = {}) => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    groupOn: { type: 'boolean' },
    data: { type: 'string' },
    y: { type: 'string' },
  },
  options: { virtual: { pair: { fields: ['data', 'y'], ...group } } },
  allOf: [
    {
      controls: { active: './flag === true' },
      properties: { data: { minLength: 3 } },
    },
  ],
});

/**
 * Find a live node, failing the case when the path is absent.
 * @param root - Tree root
 * @param path - Absolute pointer of the node
 * @returns The live node at the path
 */
const at = (
  root: ReturnType<typeof makeFieldNodeTree>['root'],
  path: string,
) => {
  const node = root.find(path);
  if (!node) throw new Error(`No node at ${path}`);
  return node;
};

const periodSchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
};

// filid:contract settle-virtual
describe('virtual writes and referenced siblings', () => {
  it('42C-02 NODE-034 NODE-054 reads loaded siblings through their real nodes', () => {
    const { root } = makeFieldNodeTree(periodSchema, {
      snapshot: {
        startDate: '2021-04-01',
        endDate: '2021-04-02',
      },
    });
    root.resetSubtree();
    const period = root.find('/period')!;
    const startDate = root.find('/startDate')!;
    const endDate = root.find('/endDate')!;
    expect(period.value).toEqual(['2021-04-01', '2021-04-02']);
    expect(period.children).toEqual([startDate, endDate]);
    expect(period.find('/period/startDate')).toBe(startDate);
    expect(period.find('/period/startDate')?.path).toBe('/startDate');
  });

  it('42C-02 18C-21 clears both leaves without refilling an existing default', () => {
    const { root } = makeFieldNodeTree(
      {
        ...periodSchema,
        properties: {
          ...periodSchema.properties,
          startDate: { type: 'string', default: 'D' },
        },
      },
      { snapshot: { startDate: '2021-04-01', endDate: '2021-04-02' } },
    );
    root.resetSubtree();
    root.find('/period')!.setValue(undefined);
    expect(root.find('/startDate')?.value).toBeUndefined();
    expect(root.find('/endDate')?.value).toBeUndefined();
    expect(root.find('/period')?.value).toEqual([undefined, undefined]);
    expect(root.outputValue).toEqual({});
  });

  it('42C-02 splits an array and reassembles after a direct leaf write', () => {
    const { root } = makeFieldNodeTree(periodSchema);
    root.resetSubtree();
    const period = root.find('/period')!;
    period.setValue(['a', 'b']);
    expect(root.outputValue).toEqual({ startDate: 'a', endDate: 'b' });
    expect(period.value).toEqual(['a', 'b']);
    const revision = period.revision();
    root.find('/startDate')!.setValue('c');
    expect(period.value).toEqual(['c', 'b']);
    expect(period.revision()).toBeGreaterThan(revision);
    period.setValue([7, 'b']);
    expect(period.value).toEqual(['7', 'b']);
  });

  it('45C-01 Merge performs a partial write at each referenced node', () => {
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          details: {
            type: 'object',
            properties: {
              first: { type: 'string' },
              second: { type: 'string' },
            },
          },
        },
        options: { virtual: { group: { fields: ['details'] } } },
      },
      { snapshot: { details: { first: 'old', second: 'keep' } } },
    );
    root.resetSubtree();
    root.find('/details/first')!.setValue('changed');
    expect(root.find('/group')?.value).toEqual([
      { first: 'changed', second: 'keep' },
    ]);
    root.find('/group')!.setValue([{ first: 'new' }], WriteOption.Merge);
    expect(root.find('/details')?.value).toEqual({
      first: 'new',
      second: 'keep',
    });
    expect(root.find('/group')?.value).toEqual([
      { first: 'new', second: 'keep' },
    ]);
    root.find('/group')!.setValue([{ first: 'whole' }]);
    expect(root.find('/details')?.value).toEqual({ first: 'whole' });
  });

  it('42C-02 keeps real siblings live when their virtual group exits', () => {
    const { root } = makeFieldNodeTree(
      {
        ...periodSchema,
        properties: {
          enabled: { type: 'boolean' },
          ...periodSchema.properties,
        },
        options: {
          virtual: {
            period: {
              fields: ['startDate', 'endDate'],
              controls: { active: '../enabled' },
            },
          },
        },
      },
      {
        snapshot: {
          enabled: true,
          startDate: '2021-04-01',
          endDate: '2021-04-02',
        },
      },
    );
    root.resetSubtree();
    const startDate = root.find('/startDate')!;
    const endDate = root.find('/endDate')!;
    expect(root.find('/period')).not.toBeNull();
    root.find('/enabled')!.setValue(false);
    expect(root.find('/period')).toBeNull();
    expect(root.find('/startDate')).toBe(startDate);
    expect(root.find('/endDate')).toBe(endDate);
    expect(Reflect.get(startDate, 'isDetached')).toBe(false);
    expect(Reflect.get(endDate, 'isDetached')).toBe(false);
  });

  it('42C-02 keeps a real sibling gate registered when its virtual group exits', () => {
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          flag: { type: 'boolean' },
          startDate: { type: 'string', controls: { active: '../flag' } },
          endDate: { type: 'string' },
        },
        options: {
          virtual: {
            period: {
              fields: ['startDate', 'endDate'],
              controls: { active: '../enabled' },
            },
          },
        },
      },
      { snapshot: { enabled: true, flag: true, startDate: 'a', endDate: 'b' } },
    );
    root.resetSubtree();
    const registry = getGateRegistry(Reflect.get(root, 'runtime'));
    expect(
      registry.mayChangeOwnDeclarationAt(
        '/startDate',
        new Set(['/flag']),
        new Set(['']),
      ),
    ).toBe(true);
    root.find('/enabled')!.setValue(false);
    expect(root.find('/period')).toBeNull();
    expect(
      registry.mayChangeOwnDeclarationAt(
        '/startDate',
        new Set(['/flag']),
        new Set(['']),
      ),
    ).toBe(true);
  });

  it('42C-02 starts a group on its parent constituents without creating nodes at load', () => {
    createdUnder.mockClear();
    const { root } = makeFieldNodeTree(narrowedPairSchema(), {
      snapshot: { flag: true, data: 'abcd', y: 'a' },
    });
    root.resetSubtree();
    const registry = getGateRegistry(Reflect.get(root, 'runtime'));
    expect(virtualCreations()).toEqual([]);
    expect(registry.occurrenceCount('/pair/data')).toBe(0);
    expect(at(root, '/pair').children).toEqual([
      at(root, '/data'),
      at(root, '/y'),
    ]);
    expect(at(root, '/data').jsonSchema).toEqual({
      type: 'string',
      minLength: 3,
    });
  });

  it('42C-02 starts a group whose own gate turns on without creating nodes', () => {
    const { root } = makeFieldNodeTree(
      narrowedPairSchema({ controls: { active: '../groupOn === true' } }),
      { snapshot: { flag: true, groupOn: false, data: 'abcd', y: 'a' } },
    );
    root.resetSubtree();
    const registry = getGateRegistry(Reflect.get(root, 'runtime'));
    expect(root.find('/pair')).toBeNull();
    createdUnder.mockClear();
    at(root, '/groupOn').setValue(true);
    expect(virtualCreations()).toEqual([]);
    expect(registry.occurrenceCount('/pair/data')).toBe(0);
    expect(at(root, '/pair').children).toEqual([
      at(root, '/data'),
      at(root, '/y'),
    ]);
  });

  it('42C-02 starts a group inside a new array item without creating nodes', () => {
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: { list: { type: 'array', items: narrowedPairSchema() } },
      },
      { snapshot: { list: [] } },
    );
    root.resetSubtree();
    const registry = getGateRegistry(Reflect.get(root, 'runtime'));
    createdUnder.mockClear();
    at(root, '/list').setValue([{ flag: true, data: 'abcd', y: 'a' }]);
    expect(virtualCreations()).toEqual([]);
    expect(registry.occurrenceCount('/list/0/pair/data')).toBe(0);
    expect(at(root, '/list/0/pair').children).toEqual([
      at(root, '/list/0/data'),
      at(root, '/list/0/y'),
    ]);
  });

  it.each([
    { label: 'null', value: null },
    { label: 'string', value: 'x' },
    { label: 'short array', value: ['a'] },
  ])(
    '42C-02 ERROR-195 rejects invalid virtual input $label before changing values',
    ({ value }) => {
      const { root } = makeFieldNodeTree(periodSchema, {
        snapshot: {
          startDate: '2021-04-01',
          endDate: '2021-04-02',
        },
      });
      root.resetSubtree();
      const before = root.outputValue;
      const period = root.find('/period')!;
      let caught: unknown;
      try {
        period.setValue(value);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(SchemaFormError);
      expect(caught).toMatchObject({
        code: 'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES',
        details: { path: '/period', expected: 2, received: value },
      });
      expect(root.outputValue).toBe(before);
      expect(period.value).toEqual(['2021-04-01', '2021-04-02']);
    },
  );
});
