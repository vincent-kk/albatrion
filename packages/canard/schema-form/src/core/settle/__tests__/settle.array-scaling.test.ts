import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SchemaNode } from '../../SchemaNode/SchemaNode';
import { SetValueOption } from '../../types/value';
import { createTestTree } from './fixtures/createTestTree';
import { writeSchemaNode } from '../index';
import { dirtyChildren } from '../utils/compute/dirtyChildren';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';

const schema = { type: 'array' as const, items: { type: 'object' as const,
  properties: { key: { type: 'number' as const } } } };
const items = (count: number, key: number) =>
  Array.from({ length: count }, () => ({ key }));

// filid:contract settle-array
describe('44C-01 array settlement scaling', () => {
  it('44C-01 SETTLE-047 parses each path-keyed entry only linearly on clear', () => {
    const count = 2000;
    const { root } = makeSchemaNodeTree(schema);
    root.setValue(items(count, 0));
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    const parse = JSON.parse;
    let parses = 0;
    const spy = vi.spyOn(JSON, 'parse').mockImplementation((value) => {
      parses++;
      return parse(value);
    });
    try {
      root.clear();
      expect(parses).toBeLessThan(count * 20);
    } finally {
      spy.mockRestore();
    }
  });

  it('44C-01 SETTLE-047 scans rule keys only linearly on derived push', () => {
    const count = 2000;
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    } });
    root.setValue(Array.from({ length: count }, () => ({ source: 'a' })));
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    const iterate = Set.prototype[Symbol.iterator];
    let scannedRuleKeys = 0;
    const spy = vi.spyOn(Set.prototype, Symbol.iterator)
      .mockImplementation(function* (this: Set<unknown>) {
        for (const value of iterate.call(this)) {
          if (typeof value === 'string' && value.startsWith('["/'))
            scannedRuleKeys++;
          yield value;
        }
        return undefined;
      });
    try {
      root.push({ source: 'b' });
      expect(scannedRuleKeys).toBeLessThan(count * 20);
    } finally {
      spy.mockRestore();
    }
  });

  it('NODE-026 preserves untouched emitted items after one changed keystroke', () => {
    const { root } = makeSchemaNodeTree(schema);
    root.setValue(items(3, 0));
    const before = root.value as { key: number }[];
    root.find('/1/key')!.setValue(1);
    const after = root.value as { key: number }[];
    expect(after).not.toBe(before);
    expect(after).toEqual([{ key: 0 }, { key: 1 }, { key: 0 }]);
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
  });

  it('SETTLE-042 retains the root array on a same-value keystroke', () => {
    const { root } = makeSchemaNodeTree(schema);
    root.setValue(items(3, 0));
    const before = root.value;
    root.find('/1/key')!.setValue(0);
    expect(root.value).toBe(before);
  });

  it('NODE-026 visits only dirty item slots on a 2,000-item keystroke', () => {
    const { root } = makeSchemaNodeTree(schema);
    root.setValue(items(2000, 0));
    const structure = Reflect.get(root, 'structure') as Record<string, unknown>;
    let slotReads = 0;
    Reflect.set(root, 'structure', new Proxy(structure, { get(target, property, receiver) {
      if (typeof property === 'string' && /^\d+$/.test(property)) slotReads++;
      return Reflect.get(target, property, receiver);
    } }));
    root.find('/1000/key')!.setValue(1);
    expect(slotReads).toBeLessThan(20);
  });

  it('SETTLE-047 does not scan all dirty paths for every branch on a whole write', () => {
    const count = 400;
    const { root, runtime } = makeSchemaNodeTree(schema);
    root.setValue(items(count, 0));
    const scratch = Reflect.get(runtime, 'settlementScratch') as {
      dirtyPaths: Set<string> };
    const original = scratch.dirtyPaths[Symbol.iterator].bind(scratch.dirtyPaths);
    let visited = 0;
    const iterator = vi.spyOn(scratch.dirtyPaths, Symbol.iterator)
      .mockImplementation(function* () {
        for (const path of original()) {
          visited++;
          yield path;
        }
        return undefined;
      });
    try {
      root.setValue(items(count, 1));
      expect(visited).toBeLessThan(count * 30);
    } finally {
      iterator.mockRestore();
    }
  });

  it('SETTLE-047 retains live dirty-path order after a path is removed', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'string' } });
    writeSchemaNode(root, ['a', 'b'], 'callerReplace', SetValueOption.Overwrite);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace',
      SetValueOption.Overwrite, scratch);
    try {
      context.dirtyPaths.add('/0/first');
      context.dirtyPaths.add('/1/first');
      context.dirtyPaths.add('/0/second');
      expect(dirtyChildren(root, context)).toEqual(root.children);
      context.dirtyPaths.delete('/0/first');
      expect(dirtyChildren(root, context)).toEqual([
        root.children![1], root.children![0],
      ]);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('SETTLE-047 indexes empty and escaped child names', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      '': { type: 'string' }, 'a/b': { type: 'string' },
    } });
    writeSchemaNode(root, { '': 'a', 'a/b': 'b' }, 'callerReplace',
      SetValueOption.Overwrite);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace',
      SetValueOption.Overwrite, scratch);
    try {
      context.dirtyPaths.add('/');
      context.dirtyPaths.add('/a~1b');
      expect(dirtyChildren(root, context)).toEqual(root.children);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});
