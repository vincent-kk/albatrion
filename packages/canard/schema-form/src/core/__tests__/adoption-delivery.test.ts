import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeEventType, FieldNodeState } from '@/schema-form/core/engine';
import { adoptFieldNodeTree } from '@/schema-form/core/surface';

const PAIR_SCHEMA = {
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' } },
} as const;

type Tree = ReturnType<typeof makeFieldNodeTree>;

const createTree = (): Tree => {
  const tree = makeFieldNodeTree(PAIR_SCHEMA);
  tree.root.setValue({ first: 'a', second: 'b' });
  return tree;
};

const expectResting = (runtime: object): void => {
  for (const key of ['entryDepth', 'batchDepth', 'visitDepth'])
    expect(Reflect.get(runtime, key) ?? 0, key).toBe(0);
  for (const key of [
    'visitBatchEntry',
    'chainErrors',
    'chainOccurrences',
    'enclosingChain',
    'batchWrites',
  ])
    expect(Reflect.get(runtime, key), key).toBeUndefined();
};

const adoptAndFeed = (previous: Tree, next: Tree): void => {
  adoptFieldNodeTree(previous.root, next.root);
  next.root.find('/first')?.setValue('fed');
};

const expectLaterFailureThrown = (next: Tree): void => {
  const failure = new Error('later listener failed');
  next.root.subscribe(() => {
    throw failure;
  });
  expect(() => next.root.find('/second')?.setValue('later')).toThrow(failure);
  expect(next.root.value).toEqual({ first: 'fed', second: 'later' });
};

describe('adoption during an event delivery', () => {
  it('a standalone setState whose UpdateState listener adopts leaves both runtimes resting', () => {
    const previous = createTree();
    const next = createTree();
    let heard = false;
    previous.root.find('/first')?.subscribe((event) => {
      if (heard || !(event.type & FieldNodeEventType.UpdateState)) return;
      heard = true;
      adoptAndFeed(previous, next);
    });
    previous.root.find('/first')?.setState({ [FieldNodeState.Touched]: true });
    expect(next.root.value).toEqual({ first: 'fed', second: 'b' });
    expectResting(previous.runtime);
    expectResting(next.runtime);
    expectLaterFailureThrown(next);
  });

  it.each([
    [
      'batch()',
      (previous: Tree) =>
        previous.root.batch(() => {
          previous.root.find('/second')?.setValue('c');
        }),
    ],
    [
      'a plain write',
      (previous: Tree) => previous.root.find('/second')?.setValue('c'),
    ],
  ])(
    'a chain-exit listener that adopts after %s delivers the new root and closes both chains',
    (_, write) => {
      const previous = createTree();
      const next = createTree();
      const delivered: unknown[] = [];
      next.root.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateValue)
          delivered.push(next.root.value);
      });
      let heard = false;
      previous.root.subscribe((event) => {
        if (heard || !(event.type & FieldNodeEventType.UpdateValue)) return;
        heard = true;
        adoptAndFeed(previous, next);
      });
      write(previous);
      expect(delivered).toEqual([{ first: 'fed', second: 'b' }]);
      expectResting(previous.runtime);
      expectResting(next.runtime);
      expectLaterFailureThrown(next);
    },
  );

  it.each([
    [
      'chain-exit',
      '',
      FieldNodeEventType.UpdateValue,
      (previous: Tree) => previous.root.find('/second')?.setValue('c'),
    ],
    [
      'standalone',
      '/first',
      FieldNodeEventType.UpdateState,
      (previous: Tree) =>
        previous.root
          .find('/first')
          ?.setState({ [FieldNodeState.Touched]: true }),
    ],
  ])(
    'adoption inside a walk started during %s delivery closes both chains',
    (_, listened, type, trigger) => {
      const previous = createTree();
      const next = createTree();
      let heard = false;
      previous.root.find(listened)?.subscribe((event) => {
        if (heard || !(event.type & type)) return;
        heard = true;
        previous.root.visitSubtree((node) => {
          if (node.path !== '') return;
          adoptAndFeed(previous, next);
          return false;
        });
      });
      trigger(previous);
      expect(next.root.value).toEqual({ first: 'fed', second: 'b' });
      expectResting(previous.runtime);
      expectResting(next.runtime);
      expectLaterFailureThrown(next);
    },
  );
});
