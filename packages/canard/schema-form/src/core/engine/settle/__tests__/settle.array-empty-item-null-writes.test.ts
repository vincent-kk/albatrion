import { describe, expect, it } from 'vitest';

import type { TestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { dispatchResetForm } from '@/schema-form/core/engine/write';

import { WriteOption } from '../../types/value';
import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** Tree mounted by `mountPublicTree`. */
type Tree = ReturnType<typeof mountPublicTree>;
/** Structural verbs of the mounted `/list` array. */
type ArrayVerbs = ReturnType<Tree['arrayAt']>;

/** An object whose `list` holds string items that default to 'D'. */
const schema = {
  type: 'object',
  properties: {
    list: { type: 'array', items: { type: 'string', default: 'D' } },
  },
};

/** An object whose `list` holds string items without a default. */
const bareSchema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
};

/** Events an array delivers for one caller write that changes its items. */
const ARRAY_WRITE_EVENT =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateChildren |
  FieldNodeEventType.RequestRefresh;

// filid:contract settle-array-empty-item-null-writes
describe('a null written to a non-nullable leaf item position', () => {
  it("reads the item's own setValue(null) as an empty item", () => {
    const tree = mountPublicTree(schema, { list: ['x', 'y'] });
    tree.at('/list/1').setValue(null);
    expect(tree.root.outputValue).toEqual({ list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
  });

  it('empties a null entry of a whole array write and fills only the undefined entry', () => {
    const tree = mountPublicTree(schema, { list: ['x'] });
    tree.arrayAt('/list').setValue(['x', null, undefined]);
    expect(tree.root.outputValue).toEqual({ list: ['x', null, 'D'] });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.at('/list/2').value).toBe('D');
  });

  it.each([
    [
      'push(null)',
      (list: ArrayVerbs) => list.push(null),
      '/list/2',
      ['x', 'y', null],
    ],
    [
      'update(1, null)',
      (list: ArrayVerbs) => list.update(1, null),
      '/list/1',
      ['x', null],
    ],
    [
      'insert(1, null)',
      (list: ArrayVerbs) => list.insert(1, null),
      '/list/1',
      ['x', null, 'y'],
    ],
  ])(
    'reads the item placed by %s as an empty item',
    (_verb, apply, path, output) => {
      const tree = mountPublicTree(schema, { list: ['x', 'y'] });
      apply(tree.arrayAt('/list'));
      expect(tree.root.outputValue).toEqual({ list: output });
      expectEmptyItem(tree.at(path));
      expect(tree.root.runtime.misfitRecords).toEqual([]);
    },
  );

  it("gives an item created with null its first value delivery, as an item created by push('x') or by loading null gets, unlike a position created without a value or default", () => {
    const given = {
      source: null,
      value: undefined,
      revisions: { updateValue: 1, requestRefresh: 1, all: 2 },
      listEvents: [ARRAY_WRITE_EVENT],
    };
    const ungiven = {
      ...given,
      revisions: { updateValue: 0, requestRefresh: 0, all: 0 },
    };
    const creations = [
      [
        'push(null)',
        schema,
        (tree: Tree) => tree.arrayAt('/list').push(null),
        '/list/2',
        given,
      ],
      [
        'insert(1, null)',
        schema,
        (tree: Tree) => tree.arrayAt('/list').insert(1, null),
        '/list/1',
        given,
      ],
      [
        'a longer array with a null entry',
        schema,
        (tree: Tree) => tree.at('/list').setValue(['x', 'y', null]),
        '/list/2',
        given,
      ],
      [
        "push('x')",
        schema,
        (tree: Tree) => tree.arrayAt('/list').push('x'),
        '/list/2',
        { ...given, source: 'x', value: 'x' },
      ],
      [
        'push() filled by the default',
        schema,
        (tree: Tree) => tree.arrayAt('/list').push(),
        '/list/2',
        { ...given, source: 'D', value: 'D' },
      ],
      [
        'push() without a default',
        bareSchema,
        (tree: Tree) => tree.arrayAt('/list').push(),
        '/list/2',
        ungiven,
      ],
      [
        'a longer array with an undefined entry and no default',
        bareSchema,
        (tree: Tree) => tree.at('/list').setValue(['x', 'y', undefined]),
        '/list/2',
        ungiven,
      ],
      [
        'a form reset that loads null',
        schema,
        (tree: Tree) => {
          const record: TestFieldNode = tree.root;
          dispatchResetForm(
            record,
            { list: ['x', 'y', null] },
            WriteOption.Overwrite,
          );
        },
        '/list/2',
        {
          ...given,
          listEvents: [ARRAY_WRITE_EVENT | FieldNodeEventType.UpdateState],
        },
      ],
    ] as const;
    const observe = ([
      creation,
      form,
      create,
      path,
    ]: (typeof creations)[number]) => {
      const tree = mountPublicTree(form, { list: ['x', 'y'] });
      const listEvents: number[] = [];
      tree.at('/list').subscribe((event) => listEvents.push(event.type));
      create(tree);
      const item = tree.at(path);
      return {
        creation,
        source: item.source,
        value: item.value,
        revisions: {
          updateValue: item.revision(FieldNodeEventType.UpdateValue),
          requestRefresh: item.revision(FieldNodeEventType.RequestRefresh),
          all: item.revision(),
        },
        listEvents,
      };
    };
    expect(creations.map(observe)).toEqual(
      creations.map(([creation, , , , expected]) => ({
        creation,
        ...expected,
      })),
    );
  });

  it.each([
    [
      'the item resets its subtree',
      (tree: Tree) => tree.at('/list/1').resetSubtree(),
    ],
    [
      'the form resets to the same value',
      (tree: Tree) => {
        const record: TestFieldNode = tree.root;
        dispatchResetForm(record, { list: ['x', null] }, WriteOption.Overwrite);
      },
    ],
  ])('restores a loaded null as an empty item when %s', (_reset, reset) => {
    const tree = mountPublicTree(schema, { list: ['x', null] });
    tree.at('/list/1').setValue('typed');
    reset(tree);
    expect(tree.root.outputValue).toEqual({ list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
  });

  it('passes an updater undefined for an item cleared with null earlier in the same batch', () => {
    const tree = mountPublicTree(schema, { list: ['x', 'y'] });
    const item = tree.at('/list/1');
    let previous: unknown = 'unread';
    tree.root.batch(() => {
      item.setValue(null);
      item.setValue((value: unknown) => (previous = value));
    });
    expect(previous).toBeUndefined();
    expect(tree.root.outputValue).toEqual({ list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
  });

  it('rewrites the output of a pushed empty item twice without an item event', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      },
      { list: ['x'] },
    );
    tree.arrayAt('/list').push();
    const item = tree.at('/list/1');
    let events = 0;
    item.subscribe(() => events++);
    const revision = item.revision();
    tree.root.setValue(tree.root.outputValue);
    tree.root.setValue(JSON.parse(JSON.stringify(tree.root.outputValue)));
    expect([item.revision() - revision, events]).toEqual([0, 0]);
    expect(tree.root.outputValue).toEqual({ list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
  });

  it('settles a derived null on every item as stable empty items', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          list: {
            type: 'array',
            items: {
              type: 'string',
              default: 'D',
              controls: { derived: '../../flag === true ? null : "v"' },
            },
          },
        },
      },
      { flag: false, list: ['a', 'b'] },
    );
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: [null, null] });
    expectEmptyItem(tree.at('/list/0'));
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.diagnostics.status).toBe('stable');
  });

  it('reads a null injected into an item as an empty item', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            controls: {
              injectTo: (value: unknown) => ({
                '../list/1': value === 'clear' ? null : value,
              }),
            },
          },
          list: schema.properties.list,
        },
      },
      { source: '', list: ['a', 'b'] },
    );
    tree.at('/source').setValue('clear');
    expect(tree.root.outputValue).toEqual({
      source: 'clear',
      list: ['a', null],
    });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.diagnostics.status).toBe('stable');
  });

  it('reads a null retained while its array was inactive as an empty item on activation', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          list: {
            ...schema.properties.list,
            controls: { active: '../flag === true' },
          },
        },
      },
      { flag: false, list: ['x', null] },
    );
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
  });
});
