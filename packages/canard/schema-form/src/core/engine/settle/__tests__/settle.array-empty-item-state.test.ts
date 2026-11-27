import { describe, expect, it } from 'vitest';

import type { ArrayNode, FieldNode } from '@/schema-form/core/surface';
import {
  SetValueOption,
  isArrayNode,
  writeFieldNodeInput,
} from '@/schema-form/core/surface';

import type { BlueprintSchema } from '../../blueprint';
import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { listSourcelessItemPaths } from './fixtures/listSourcelessItemPaths';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** Mounted public tree with its lookups. */
type Tree = ReturnType<typeof mountPublicTree>;

/** Lists of every leaf kind, with and without defaults, behind item, array, tuple and nested positions. */
const SCRIPT_SCHEMA: BlueprintSchema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    texts: { type: 'array', items: { type: 'string', default: 'D' } },
    counts: { type: 'array', items: { type: 'number' } },
    checks: {
      type: 'array',
      items: {
        type: 'boolean',
        controls: { active: '../../flag === true' },
      },
    },
    pair: {
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number', default: 1 }],
    },
    mixed: {
      type: 'array',
      controls: { active: '../flag === true' },
      items: { type: ['string', 'number'] },
    },
    nest: {
      type: 'array',
      items: { type: 'array', items: { type: 'string' } },
    },
  },
};

/** First load of the scripted sequences. */
const SCRIPT_VALUE = {
  flag: true,
  texts: ['a', 'b'],
  counts: [1, 2],
  checks: [true, false],
  pair: ['p', 2],
  mixed: ['m', 3],
  nest: [['n']],
};

/** Gated groups, tuples, nested arrays, item candidates and a compacting array for the seeded sequence. */
const SEEDED_SCHEMA: BlueprintSchema = {
  type: 'object',
  properties: {
    f: { type: 'boolean' },
    g: { type: 'boolean' },
    h: { type: 'boolean' },
    kind: { type: 'string' },
    group: {
      type: 'object',
      default: { la: ['P'] },
      controls: { active: '../h === true' },
      properties: {
        la: {
          type: 'array',
          controls: { active: '../../g === true' },
          items: {
            type: 'string',
            default: 'D',
            controls: { active: '../../../f === true' },
          },
        },
        lb: {
          type: 'array',
          allOf: [
            {
              controls: { active: '../../kind === "a"' },
              items: { type: 'string', default: 'A' },
            },
            {
              controls: { active: '../../kind === "b"' },
              items: { type: 'number', default: 7 },
            },
          ],
        },
      },
    },
    tup: {
      type: 'array',
      prefixItems: [{ type: 'string', default: 'T' }],
      items: { type: 'number' },
    },
    nest: {
      type: 'array',
      items: { type: 'array', items: { type: 'string', default: 'N' } },
    },
    comp: {
      type: 'array',
      controls: { active: '../g === true', unsetOnInactive: true },
      items: { type: 'string', controls: { unsetOnInactive: false } },
    },
  },
};

/** Arrays the seeded sequence acts on. */
const SEEDED_ARRAYS = ['/group/la', '/group/lb', '/tup', '/nest/0', '/comp'];

/** Gate inputs the seeded sequence toggles. */
const SEEDED_GATES = ['/f', '/g', '/h'];

/** Values the seeded sequence writes, including both empty inputs. */
const SEEDED_VALUES = [undefined, null, 'v', '', 3];

/**
 * Create a deterministic pseudo-random source.
 * @param seed - Initial state; the same seed replays the same sequence
 * @returns A function returning numbers in [0, 1)
 */
const createRandom = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x80000000;
};

/**
 * Read the sources of the live items of an array.
 * @param tree - Mounted tree holding a live array at `path`
 * @param path - Array path
 * @returns Each live item's source in index order
 */
const readSources = (tree: Tree, path = '/list') =>
  tree.at(path).children?.map((item: FieldNode) => item.source);

/** Random public calls of the seeded sequence; `list` is the array under test when it is live. */
const SEEDED_CALLS: readonly ((
  tree: Tree,
  list: ArrayNode | undefined,
  random: () => number,
) => void)[] = [
  (tree, _list, random) =>
    tree.at(SEEDED_GATES[Math.floor(random() * 3)]).setValue(random() < 0.5),
  (tree, _list, random) =>
    tree.at('/kind').setValue(random() < 0.5 ? 'a' : 'b'),
  (_tree, list, random) => list?.push(SEEDED_VALUES[Math.floor(random() * 5)]),
  (_tree, list) => list?.push(),
  (_tree, list, random) =>
    list?.insert(
      Math.floor(random() * ((list.children?.length ?? 0) + 1)),
      SEEDED_VALUES[Math.floor(random() * 5)],
    ),
  (_tree, list, random) => {
    const count = list?.children?.length ?? 0;
    if (count) list?.remove(Math.floor(random() * count));
  },
  (_tree, list, random) => {
    const count = list?.children?.length ?? 0;
    if (count)
      list?.update(
        Math.floor(random() * count),
        SEEDED_VALUES[Math.floor(random() * 5)],
      );
  },
  (_tree, list, random) =>
    list?.children
      ?.at(Math.floor(random() * list.children.length))
      ?.setValue(SEEDED_VALUES[Math.floor(random() * 5)]),
  (_tree, list, random) => {
    const item = list?.children?.at(
      Math.floor(random() * list.children.length),
    );
    if (item)
      writeFieldNodeInput(item, SEEDED_VALUES[Math.floor(random() * 5)]);
  },
  (_tree, list, random) =>
    list?.setValue(
      Array.from(
        { length: Math.floor(random() * 4) },
        () => SEEDED_VALUES[Math.floor(random() * 5)],
      ),
      random() < 0.5 ? SetValueOption.Merge : SetValueOption.Overwrite,
    ),
  (_tree, list, random) =>
    list?.setValue(
      Array.from(
        { length: Math.floor(random() * 4) },
        () => SEEDED_VALUES[Math.floor(random() * 5)],
      ),
      SetValueOption.DisableAutomaticWrites,
    ),
  (tree) => tree.root.setValue(tree.root.outputValue),
  (_tree, list) => list?.setValue((previous: unknown) => previous),
  (tree, _list, random) => {
    if (random() < 0.3) tree.root.resetSubtree();
  },
];

/** A gated list whose second item is empty after the first load. */
const REWRITE_SCHEMA: BlueprintSchema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    list: {
      type: 'array',
      controls: { active: '../flag === true' },
      items: { type: 'string', default: 'D' },
    },
  },
};

// filid:contract settle-array-empty-item-state
describe('the stored state of an empty array item position', () => {
  it.each([
    [
      'array verbs and value writes',
      [
        ['push() on numbers', (tree: Tree) => tree.arrayAt('/counts').push()],
        [
          'push(undefined) on texts',
          (tree: Tree) => tree.arrayAt('/texts').push(undefined),
        ],
        [
          'insert(0) on numbers',
          (tree: Tree) => tree.arrayAt('/counts').insert(0),
        ],
        [
          'insert(1, undefined) on unions',
          (tree: Tree) => tree.arrayAt('/mixed').insert(1, undefined),
        ],
        [
          'update(0, undefined) on texts',
          (tree: Tree) => tree.arrayAt('/texts').update(0, undefined),
        ],
        [
          'remove(0) on numbers',
          (tree: Tree) => tree.arrayAt('/counts').remove(0),
        ],
        ['pop() on texts', (tree: Tree) => tree.arrayAt('/texts').pop()],
        [
          'setValue(undefined) on a text item',
          (tree: Tree) => tree.at('/texts/0').setValue(undefined),
        ],
        [
          'setValue(null) on a number item',
          (tree: Tree) => tree.at('/counts/0').setValue(null),
        ],
        [
          'an input-boundary undefined on a check item',
          (tree: Tree) => writeFieldNodeInput(tree.at('/checks/0'), undefined),
        ],
        [
          'an overwrite with undefined entries',
          (tree: Tree) =>
            tree.at('/counts').setValue([undefined, 2, undefined]),
        ],
        [
          'a longer merge',
          (tree: Tree) =>
            tree
              .at('/texts')
              .setValue(
                [undefined, undefined, 'x', undefined],
                SetValueOption.Merge,
              ),
        ],
        [
          'a tuple write of undefined positions',
          (tree: Tree) => tree.at('/pair').setValue([undefined, undefined]),
        ],
        [
          'a longer write without automatic writes',
          (tree: Tree) =>
            tree
              .at('/counts')
              .setValue(
                [1, undefined, undefined],
                SetValueOption.DisableAutomaticWrites,
              ),
        ],
        [
          'push of an inner array with an undefined entry',
          (tree: Tree) => tree.arrayAt('/nest').push([undefined, 'n']),
        ],
        [
          'push() on an inner array',
          (tree: Tree) => tree.arrayAt('/nest/0').push(),
        ],
      ],
    ],
    [
      'gates, batches and resets',
      [
        [
          'hiding the gated lists',
          (tree: Tree) => tree.at('/flag').setValue(false),
        ],
        [
          'push() on hidden checks',
          (tree: Tree) => tree.arrayAt('/checks').push(),
        ],
        [
          'showing the gated lists',
          (tree: Tree) => tree.at('/flag').setValue(true),
        ],
        [
          'a batch that empties a check and hides it',
          (tree: Tree) =>
            tree.root.batch(() => {
              tree.at('/checks/0').setValue(undefined);
              tree.at('/flag').setValue(false);
            }),
        ],
        ['showing again', (tree: Tree) => tree.at('/flag').setValue(true)],
        [
          'a batch of two pushes',
          (tree: Tree) =>
            tree.root.batch(() => {
              tree.arrayAt('/counts').push();
              tree.arrayAt('/texts').push();
            }),
        ],
        [
          'one root write that empties positions and hides',
          (tree: Tree) =>
            tree.root.setValue({
              flag: false,
              texts: [undefined],
              counts: [null, undefined],
              checks: [undefined],
              mixed: [undefined, 1],
            }),
        ],
        [
          'showing after the root write',
          (tree: Tree) => tree.at('/flag').setValue(true),
        ],
        [
          'resetSubtree() on the root',
          (tree: Tree) => tree.root.resetSubtree(),
        ],
        [
          'resetSubtree() on a list',
          (tree: Tree) => tree.at('/counts').resetSubtree(),
        ],
        [
          'rewriting the root output',
          (tree: Tree) => tree.root.setValue(tree.root.outputValue),
        ],
        [
          'an identity updater on a list',
          (tree: Tree) =>
            tree.at('/texts').setValue((previous: unknown) => previous),
        ],
      ],
    ],
  ] as const)(
    'leaves no live empty position without its null source after each call of %s',
    (_script, steps) => {
      const tree = mountPublicTree(SCRIPT_SCHEMA, SCRIPT_VALUE);
      expect(listSourcelessItemPaths(tree.root)).toEqual([]);
      for (const [step, call] of steps) {
        call(tree);
        expect({ step, paths: listSourcelessItemPaths(tree.root) }).toEqual({
          step,
          paths: [],
        });
      }
    },
  );

  it('leaves no live empty position without its null source after each call of a seeded random sequence', () => {
    const random = createRandom(12345);
    const failures: string[] = [];
    for (let run = 0; run < 30; run++) {
      const tree = mountPublicTree(SEEDED_SCHEMA, {
        f: true,
        g: true,
        h: true,
        kind: 'a',
        group: { la: ['x', 'y'], lb: ['p', 'q'] },
        tup: ['t', 1],
        nest: [['n', 'm']],
        comp: ['c', 'd'],
      });
      for (let step = 0; step < 40; step++) {
        const call = Math.floor(random() * SEEDED_CALLS.length);
        const path = SEEDED_ARRAYS[Math.floor(random() * SEEDED_ARRAYS.length)];
        const found = tree.root.find(path);
        const list = isArrayNode(found) ? found : undefined;
        if (random() < 0.25)
          tree.root.batch(() => {
            SEEDED_CALLS[call](tree, list, random);
            SEEDED_CALLS[0](tree, list, random);
          });
        else SEEDED_CALLS[call](tree, list, random);
        const paths = listSourcelessItemPaths(tree.root);
        if (paths.length)
          failures.push(`${run}:${step} call ${call} on ${path}: ${paths}`);
      }
    }
    expect(failures).toEqual([]);
  });

  describe.each([
    ['outside a batch', false],
    ['inside a batch', true],
  ] as const)('rewriting what an empty item reads, %s', (_where, batched) => {
    it.each([
      [
        "the item's own value",
        (tree: Tree) => {
          const item = tree.at('/list/1');
          item.setValue(item.value);
        },
      ],
      ['null onto the item', (tree: Tree) => tree.at('/list/1').setValue(null)],
      [
        "the root's output",
        (tree: Tree) => tree.root.setValue(tree.root.outputValue),
      ],
      [
        'an identity updater on the array',
        (tree: Tree) =>
          tree.at('/list').setValue((previous: unknown) => previous),
      ],
    ])(
      'changes no source, event or revision when it writes %s, and the item stays empty after its array re-enters',
      (_write, write) => {
        const tree = mountPublicTree(REWRITE_SCHEMA, {
          flag: true,
          list: ['x', null],
        });
        const item = tree.at('/list/1');
        const events: unknown[] = [];
        item.subscribe((event) => events.push(event.type));
        const revisions = [tree.root.revision(), item.revision()];
        if (batched) tree.root.batch(() => write(tree));
        else write(tree);
        expect({
          source: item.source,
          events,
          revisions: [tree.root.revision(), item.revision()],
        }).toEqual({ source: null, events: [], revisions });
        tree.at('/flag').setValue(false);
        tree.at('/flag').setValue(true);
        expect(tree.root.outputValue).toEqual({
          flag: true,
          list: ['x', null],
        });
        expectEmptyItem(tree.at('/list/1'));
      },
    );
  });

  it.each([
    [
      'a string item cleared with undefined',
      { items: { type: 'string', default: 'D' } },
      ['x', 'y'],
      (tree: Tree) => tree.at('/list/1').setValue(undefined),
      ['x', null],
    ],
    [
      'a number item pushed without a value or a default',
      { items: { type: 'number' } },
      [1],
      (tree: Tree) => tree.arrayAt('/list').push(),
      [1, null],
    ],
    [
      'a tuple position its array wrote as undefined',
      {
        prefixItems: [{ type: 'string' }, { type: 'number', default: 1 }],
      },
      ['p', 2],
      (tree: Tree) => tree.at('/list').setValue(['p', undefined]),
      ['p', null],
    ],
    [
      'a union item cleared with null',
      { items: { type: ['string', 'number'], default: 'D' } },
      ['x', 2],
      (tree: Tree) => tree.at('/list/1').setValue(null),
      ['x', null],
    ],
  ])(
    'stores %s with the source that a fresh load of the saved output gives',
    (_position, declaration, list, edit, sources) => {
      const schema = {
        type: 'object',
        properties: { list: { type: 'array', ...declaration } },
      };
      const edited = mountPublicTree(schema, { list });
      edit(edited);
      const fresh = mountPublicTree(
        schema,
        JSON.parse(JSON.stringify(edited.root.outputValue)),
      );
      expect([readSources(edited), readSources(fresh)]).toEqual([
        sources,
        sources,
      ]);
      expect(fresh.root.outputValue).toEqual(edited.root.outputValue);
    },
  );
});
