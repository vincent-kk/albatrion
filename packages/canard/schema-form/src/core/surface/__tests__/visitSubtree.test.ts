import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeEventType } from '@/schema-form/core/engine';
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
    const { root } = makeFieldNodeTree(PAIR_SCHEMA);
    root.setValue({ first: 'a', second: 'b' });
    const failure = new Error('visitor failed');
    expect(() =>
      root.visitSubtree((node) => {
        if (node.path === '/first') node.setValue('written');
        if (node.path === '/second') throw failure;
      }),
    ).toThrow(failure);
    expect(root.value).toEqual({ first: 'written', second: 'b' });
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
