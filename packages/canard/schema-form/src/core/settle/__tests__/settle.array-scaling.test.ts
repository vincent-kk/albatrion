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
const gatedRows = (count: number) => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    flag: { type: 'boolean' }, rows: { type: 'array', items: {
      type: 'object', properties: { child: { type: 'string',
        controls: { active: '#/flag' } } },
    } },
  } });
  if (!(root instanceof SchemaNode))
    throw new Error('Expected a runtime SchemaNode');
  root.setValue({ flag: true, rows: Array.from({ length: count }, (_, index) =>
    ({ child: String(index) })) });
  return { root, runtime: root.runtime };
};

/**
 * Count latent key visits made by one settlement operation.
 * @param latent - Store whose key iterator is the measured operation
 * @param action - Settlement operation to run while visits are counted
 * @returns Number of latent keys yielded during the operation
 */
const countLatentKeyVisits = (latent: Map<string, unknown>, action: () => void): number => {
  const keys = latent.keys.bind(latent);
  let visited = 0;
  const spy = vi.spyOn(latent, 'keys').mockImplementation(function* () {
    for (const key of keys()) {
      visited++;
      yield key;
    }
    return undefined;
  });
  try {
    action();
  } finally {
    spy.mockRestore();
  }
  return visited;
};

// filid:contract settle-array
describe('44C-01 array settlement scaling', () => {
  it('48C-01 SETTLE-017 visits inactive memo entries linearly on mass exit', () => {
    const count = 2000;
    const { root } = gatedRows(count);
    const filter = Array.prototype.filter;
    let visited = 0;
    Array.prototype.filter = function (this: unknown[], callback: unknown,
      thisArg?: unknown) {
      if (this.length && typeof this[0] === 'object' && this[0] !== null &&
        'entry' in this[0] && 'order' in this[0]) visited += this.length;
      return Reflect.apply(filter, this, [callback, thisArg]);
    } as typeof Array.prototype.filter;
    try {
      root.find('/flag')!.setValue(false);
      expect(visited).toBeLessThan(count * 12);
    } finally {
      Array.prototype.filter = filter;
    }
  });

  it('48C-01 SETTLE-017 assembles the affected array once on mass exit', () => {
    const count = 2000;
    const { root } = gatedRows(count);
    const rows = root.find('/rows');
    if (!(rows instanceof SchemaNode))
      throw new Error('Expected an array SchemaNode');
    const behavior = rows.behavior;
    let assemblies = 0;
    Reflect.set(rows, 'behavior', { ...behavior,
      assemble: (...args: Parameters<typeof behavior.assemble>) => {
        if (args[0] === rows) assemblies++;
        return behavior.assemble(...args);
      },
    });
    try {
      root.find('/flag')!.setValue(false);
      expect(assemblies).toBeLessThan(10);
    } finally {
      Reflect.set(rows, 'behavior', behavior);
    }
  });

  it('48C-01 SETTLE-017 visits latent entries linearly on mass exit', () => {
    const count = 2000;
    const { root, runtime } = gatedRows(count);
    const keys = runtime.latentRaw.keys.bind(runtime.latentRaw);
    let visited = 0;
    const spy = vi.spyOn(runtime.latentRaw, 'keys').mockImplementation(function* () {
      for (const key of keys()) {
        visited++;
        yield key;
      }
      return undefined;
    });
    try {
      root.find('/flag')!.setValue(false);
      expect(visited).toBeLessThan(count * 12);
    } finally {
      spy.mockRestore();
    }
  });

  it('48C-01 retains mass exit and re-entry values and inactive sources', () => {
    for (const count of [1, 7, 13]) {
      const { root, runtime } = gatedRows(count);
      const rows = Array.from({ length: count }, (_, index) =>
        ({ child: String(index) }));
      const inactive = Array.from({ length: count }, (_, index) =>
        ({ path: `/rows/${index}/child`, value: String(index) }));
      for (const flag of [false, true, false]) {
        root.find('/flag')!.setValue(flag);
        expect(root.value).toEqual({ flag, rows: flag ? rows :
          Array.from({ length: count }, () => ({})) });
        expect(root.inactiveValues).toEqual(flag ? [] : inactive);
        expect([...runtime.latentRaw]).toEqual(flag ? [] :
          inactive.map(({ path, value }) =>
            [JSON.stringify([path, 'string']), value]));
      }
    }
  });

  it('48C-01 SETTLE-017 bounds latent key visits for exit, capture and absent writes', () => {
    const count = 250;
    const tags = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, rows: { type: 'array', items: {
        type: 'object', properties: { tags: { type: 'array',
          controls: { active: '#/flag' }, items: { type: 'string' } } },
      } },
    } }).root;
    if (!(tags instanceof SchemaNode)) throw new Error('Expected a runtime SchemaNode');
    const tagRows = Array.from({ length: count }, (_, index) =>
      ({ tags: [String(index)] }));
    tags.setValue({ flag: true, rows: tagRows });
    const tagVisits = countLatentKeyVisits(tags.runtime.latentRaw,
      () => tags.find('/flag')!.setValue(false));
    expect(tags.value).toEqual({ flag: false,
      rows: Array.from({ length: count }, () => ({})) });
    expect(tags.inactiveValues).toEqual(tagRows.map((row, index) =>
      ({ path: `/rows/${index}/tags`, value: row.tags })));
    tags.find('/flag')!.setValue(true);
    expect(tags.value).toEqual({ flag: true, rows: tagRows });
    expect(tags.inactiveValues).toEqual([]);

    const list = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, rows: { type: 'array', items: {
        type: 'object', properties: { list: { type: 'array',
          controls: { active: '#/flag' }, items: { type: 'object',
            controls: { active: './on === true' }, properties: {
              on: { type: 'boolean' }, child: { type: 'string' },
            } },
        } },
      } },
    } }).root;
    if (!(list instanceof SchemaNode)) throw new Error('Expected a runtime SchemaNode');
    const listRows = Array.from({ length: count }, (_, index) =>
      ({ list: [{ on: false, child: String(index) }] }));
    list.setValue({ flag: true, rows: listRows });
    const listVisits = countLatentKeyVisits(list.runtime.latentRaw,
      () => list.find('/flag')!.setValue(false));
    expect(list.value).toEqual({ flag: false,
      rows: listRows.map(() => ({})) });
    expect(list.inactiveValues).toEqual(listRows.map((row, index) =>
      ({ path: `/rows/${index}/list`, value: row.list })));
    list.find('/flag')!.setValue(true);
    expect(list.value).toEqual({ flag: true, rows: listRows.map(() =>
      ({ list: [{}] })) });
    expect(list.inactiveValues).toEqual(listRows.flatMap((row, index) => [
      { path: `/rows/${index}/list/0/on`, value: row.list[0].on },
      { path: `/rows/${index}/list/0/child`, value: row.list[0].child },
    ]));

    const properties = Object.fromEntries(Array.from({ length: count }, (_, index) =>
      [`g${index}`, { type: 'object' as const, controls: { active: '#/flag' },
        properties: { child: { type: 'string' as const } } }]));
    const absent = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, ...properties,
    } }).root;
    if (!(absent instanceof SchemaNode)) throw new Error('Expected a runtime SchemaNode');
    const absentRows = Object.fromEntries(Array.from({ length: count }, (_, index) =>
      [`g${index}`, { child: String(index) }]));
    absent.setValue({ flag: false });
    const absentVisits = countLatentKeyVisits(absent.runtime.latentRaw,
      () => absent.setValue({ flag: false, ...absentRows }));
    expect(absent.value).toEqual({ flag: false });
    expect(absent.inactiveValues).toEqual(Array.from({ length: count }, (_, index) =>
      ({ path: `/g${index}/child`, value: String(index) })));
    absent.find('/flag')!.setValue(true);
    expect(absent.value).toEqual({ flag: true, ...absentRows });
    expect(absent.inactiveValues).toEqual([]);

    expect(tagVisits).toBeLessThan(count * 12);
    expect(listVisits).toBeLessThan(count * 12);
    expect(absentVisits).toBeLessThan(count * 12);
  });

  it('48C-01 retains sibling latent descendants added after an index read', () => {
    const group = { type: 'object' as const,
      controls: { active: '#/f2', unsetOnInactive: true },
      properties: { m: { type: 'object' as const,
        controls: { unsetOnInactive: false },
        properties: { x1: { type: 'string' as const,
          controls: { active: '#/f1' } } },
      } },
    };
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      f1: { type: 'boolean' }, f2: { type: 'boolean' },
      xa: group, xb: group,
    } });
    root.setValue({ f1: true, f2: true,
      xa: { m: { x1: 'A', extra: 'a' } },
      xb: { m: { x1: 'B', extra: 'b' } } });
    root.find('/f1')!.setValue(false);
    root.find('/f2')!.setValue(false);
    expect(root.inactiveValues).toEqual(expect.arrayContaining([
      { path: '/xa/m/x1', value: 'A' },
      { path: '/xb/m/x1', value: 'B' },
    ]));
  });

  it('44C-01 SETTLE-047 scans path stores once when nested arrays grow', () => {
    const count = 2000;
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: { tags: { type: 'array', items: {
        type: 'string',
      } } },
    } });
    root.setValue(Array.from({ length: count }, () => ({ tags: ['a'] })));
    const parse = JSON.parse;
    let parses = 0;
    const spy = vi.spyOn(JSON, 'parse').mockImplementation((value) => {
      parses++;
      return parse(value);
    });
    try {
      root.setValue(Array.from({ length: count }, () => ({ tags: ['a', 'b'] })));
      expect(parses).toBeLessThan(count * 20);
    } finally {
      spy.mockRestore();
    }
  });

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
