import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeEventType, FieldNodeState } from '@/schema-form/core/engine';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import type { FieldNode } from '../type';

const NESTED_SCHEMA = {
  type: 'object',
  properties: {
    a: { type: 'object', properties: { x: { type: 'string' } } },
    b: { type: 'string' },
  },
} as const;

const PAIR_SCHEMA = {
  type: 'object',
  properties: {
    first: { type: 'string' },
    second: { type: 'string' },
  },
} as const;

const collectPaths = (origin: FieldNode, prune?: string): string[] => {
  const paths: string[] = [];
  origin.visitSubtree((node) => {
    paths.push(node.path);
    return node.path !== prune;
  });
  return paths;
};

const expectChainClosed = (runtime: object): void => {
  expect(Reflect.get(runtime, 'entryDepth') ?? 0).toBe(0);
  expect(Reflect.get(runtime, 'batchDepth') ?? 0).toBe(0);
  expect(Reflect.get(runtime, 'visitDepth') ?? 0).toBe(0);
  expect(Reflect.get(runtime, 'visitBatchEntry')).toBeUndefined();
};

const countValueEvents = (root: FieldNode): (() => number) => {
  let count = 0;
  root.subscribe((event) => {
    if (event.type & FieldNodeEventType.UpdateValue) count += 1;
  });
  return () => count;
};

// filid:contract surface-visit
describe('SURFACE-062 visitSubtree order and range', () => {
  it('visits itself first, then descendants in preorder with terminals as leaves', () => {
    const { root } = makeFieldNodeTree(NESTED_SCHEMA);
    root.setValue({ a: { x: 'v' }, b: 'w' });
    expect(collectPaths(root)).toEqual(['', '/a', '/a/x', '/b']);
    const a = root.find('/a');
    if (!a) throw new Error('Expected /a');
    expect(collectPaths(a)).toEqual(['/a', '/a/x']);
  });

  it('skips only the descendants of a node whose visitor returns false', () => {
    const { root } = makeFieldNodeTree(NESTED_SCHEMA);
    root.setValue({ a: { x: 'v' }, b: 'w' });
    expect(collectPaths(root, '/a')).toEqual(['', '/a', '/b']);
  });

  it('leaves nodes outside the current shape unvisited', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    root.setValue({ flag: true, target: 'shown' });
    expect(collectPaths(root)).toEqual(['', '/flag', '/target']);
    root.find('/flag')?.setValue(false);
    expect(collectPaths(root)).toEqual(['', '/flag']);
  });

  it('walks the subtree a detached node was detached with, as other structure reads do', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: {
          type: 'object',
          properties: { inner: { type: 'string' } },
          controls: { active: '../flag' },
        },
      },
    });
    root.setValue({ flag: true, target: { inner: 'v' } });
    const target = root.find('/target');
    if (!target) throw new Error('Expected /target');
    root.find('/flag')?.setValue(false);
    expect(Reflect.get(target, 'detached')).toBe(true);
    expect(collectPaths(target)).toEqual(['/target', '/target/inner']);
  });

  it('sends a write in a detached subtree to the latent source, never to the live node at its path', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: {
          type: 'object',
          properties: { inner: { type: 'string' } },
          controls: { active: '../flag' },
        },
      },
    });
    root.setValue({ flag: true, target: { inner: 'v' } });
    const old = root.find('/target');
    if (!old) throw new Error('Expected /target');
    const writeInner = (value: string) =>
      old.visitSubtree((node) => {
        if (node.path === '/target/inner') node.setValue(value);
      });
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target/inner');
    if (!current) throw new Error('Expected a live /target/inner');
    writeInner('x');
    expect(current.value).toBe('v');
    root.find('/flag')?.setValue(false);
    writeInner('y');
    root.find('/flag')?.setValue(true);
    expect(root.find('/target/inner')?.value).toBe('y');
  });

  it('visits a node reached again through a virtual group only once', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    });
    root.setValue({ a: 'x', b: 'y' });
    const nodes: FieldNode[] = [];
    root.visitSubtree((node) => {
      nodes.push(node);
    });
    expect(new Set(nodes).size).toBe(nodes.length);
    expect(nodes.map((node) => node.path).sort()).toEqual(
      ['', '/a', '/b', '/pair'].sort(),
    );
  });
});

// filid:contract surface-visit
describe('SURFACE-062 visitSubtree writes', () => {
  it('enters no chain when the visitor only reads', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const events = countValueEvents(root);
    root.visitSubtree((node) => {
      expect(Reflect.get(runtime, 'entryDepth') ?? 0).toBe(0);
      expect(node.value).toBeDefined();
    });
    expect(Reflect.get(runtime, 'entryDepth') ?? 0).toBe(0);
    expect(events()).toBe(0);
  });

  it('delivers state changes made inside the walk once when it ends, as a batch does', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const delivered: string[] = [];
    for (const path of ['/first', '/second'])
      root.find(path)?.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateState) delivered.push(path);
      });
    root.visitSubtree((node) => {
      if (node.path === '') return;
      node.setState({ [FieldNodeState.Touched]: true });
      expect(delivered).toEqual([]);
    });
    expect(delivered).toEqual(['/first', '/second']);
    expectChainClosed(runtime);
  });

  it('opens a batch at the first write and settles once when the walk ends', () => {
    const { root } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const events = countValueEvents(root);
    const seen: unknown[] = [];
    root.visitSubtree((node) => {
      if (node.path === '') return;
      node.setValue(node.value + '!');
      seen.push(root.value);
    });
    expect(seen).toEqual([
      { first: 'a', second: 'b' },
      { first: 'a', second: 'b' },
    ]);
    expect(root.value).toEqual({ first: 'a!', second: 'b!' });
    expect(events()).toBe(1);
  });

  it('joins an enclosing batch and settles at its end', () => {
    const { root } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const events = countValueEvents(root);
    root.batch(() => {
      root.visitSubtree((node) => {
        if (node.path !== '') node.setValue('z');
      });
      expect(root.value).toEqual({ first: 'a', second: 'b' });
      expect(events()).toBe(0);
    });
    expect(root.value).toEqual({ first: 'z', second: 'z' });
    expect(events()).toBe(1);
  });

  it('runs inside a listener, where a write lands as ordinary listener feedback', () => {
    const { root } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const visited: string[] = [];
    let heard = false;
    root.subscribe((event) => {
      if (heard || !(event.type & FieldNodeEventType.UpdateValue)) return;
      heard = true;
      root.visitSubtree((node) => {
        visited.push(node.path);
        if (node.path === '/first') node.setValue('fed');
      });
    });
    root.find('/second')?.setValue('c');
    expect(visited).toEqual(['', '/first', '/second']);
    expect(root.value).toEqual({ first: 'fed', second: 'c' });
  });

  it('refuses a write inside the error observer as a direct write is refused', () => {
    const seen: unknown[] = [];
    const failure = new Error('listener');
    const { root } = makeFieldNodeTree(PAIR_SCHEMA, {
      errorReporter: {
        hasConsumer: () => true,
        report: () => {
          try {
            root.visitSubtree((node) => {
              if (node.path === '/first') node.setValue('blocked');
            });
          } catch (error) {
            seen.push(error);
          }
        },
      },
    });
    root.setValue({ first: 'a', second: 'b' });
    root.subscribe(() => {
      throw failure;
    });
    expect(() => root.find('/second')?.setValue('c')).toThrow(failure);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBeInstanceOf(SchemaFormError);
    if (!(seen[0] instanceof SchemaFormError))
      throw new Error('Expected write failure');
    expect(seen[0].code).toBe(FormErrorCode.WriteInObserver);
    expect(root.value).toEqual({ first: 'a', second: 'c' });
  });

  it('commits marked writes and then rethrows a visitor failure', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const failure = new Error('visitor failed');
    expect(() =>
      root.visitSubtree((node) => {
        if (node.path === '/first') node.setValue('written');
        if (node.path === '/second') throw failure;
      }),
    ).toThrow(failure);
    expect(root.value).toEqual({ first: 'written', second: 'b' });
    expectChainClosed(runtime);
  });

  it('settles a nested walk once at the outer end and rethrows its failure', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const events = countValueEvents(root);
    const failure = new Error('inner failed');
    expect(() =>
      root.visitSubtree((node) => {
        if (node.path !== '/first') return;
        node.visitSubtree((inner) => {
          inner.setValue('inner');
          throw failure;
        });
      }),
    ).toThrow(failure);
    expect(root.value).toEqual({ first: 'inner', second: 'b' });
    expect(events()).toBe(1);
    expectChainClosed(runtime);
  });

  it('lets a batch opened inside a walk join the walk and settle when the walk ends', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const events = countValueEvents(root);
    let afterBatch: unknown;
    root.visitSubtree((node) => {
      if (node.path !== '') return;
      root.batch(() => {
        root.find('/first')?.setValue('x');
      });
      afterBatch = root.value;
    });
    expect(afterBatch).toEqual({ first: 'a', second: 'b' });
    expect(root.value).toEqual({ first: 'x', second: 'b' });
    expect(events()).toBe(1);
    expectChainClosed(runtime);
  });

  it('keeps a listener write inside a state delivery to that delivery and still rethrows the visitor failure', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both fields');
    let fed = false;
    first.subscribe((event) => {
      if (fed || !(event.type & FieldNodeEventType.UpdateState)) return;
      fed = true;
      second.setValue('fed');
    });
    const failure = new Error('visitor failed');
    expect(() =>
      root.visitSubtree((node) => {
        if (node === first) node.setState({ [FieldNodeState.Touched]: true });
        if (node === second) throw failure;
      }),
    ).toThrow(failure);
    expect(root.value).toEqual({ first: 'a', second: 'fed' });
    expect(Reflect.get(runtime, 'chainErrors')).toBeUndefined();
    expect(Reflect.get(runtime, 'enclosingChain')).toBeUndefined();
    expectChainClosed(runtime);
    const listenerFailure = new Error('listener failed');
    root.subscribe(() => {
      throw listenerFailure;
    });
    expect(() => second.setValue('y')).toThrow(listenerFailure);
  });

  it('rethrows a failure from a walk that wrote nothing', () => {
    const { root, runtime } = makeFieldNodeTree(PAIR_SCHEMA);
    const failure = new Error('read failed');
    expect(() =>
      root.visitSubtree(() => {
        throw failure;
      }),
    ).toThrow(failure);
    expect(Reflect.get(runtime, 'visitDepth')).toBe(0);
    expect(Reflect.get(runtime, 'entryDepth') ?? 0).toBe(0);
  });
});
