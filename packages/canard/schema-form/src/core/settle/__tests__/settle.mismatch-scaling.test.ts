import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { setLoadValue } from '../utils/load/setLoadValue';

const probe = (label: string, count: number): void => {
  if (process.env.SETTLE_SCALING_PROBE) console.info(`${label}: ${count}`);
};

// filid:contract settle-budget
describe('49C-01 SETTLE-017 proportional settlement work', () => {
  it('M26 indexes mismatches without filtering all paths per ancestor', () => {
    const count = 2000;
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      name: { type: 'string' }, rows: { type: 'array', items: {
        type: 'object', properties: { addr: { type: 'object',
          properties: { city: { type: 'string' } } } },
      } },
    } });
    root.setValue({ name: 'before', rows: Array.from({ length: count },
      () => ({ addr: null })) });
    const rows = root.find('/rows')!;
    const first = root.find('/rows/0')!;
    const beforeRows = rows.typeMismatches;
    const beforeFirst = first.typeMismatches;
    const filter = Array.prototype.filter;
    let visited = 0;
    const spy = vi.spyOn(Array.prototype, 'filter').mockImplementation(
      function (this: unknown[], callback, thisArg) {
        if (this.length === count && typeof this[0] === 'string' &&
          this[0].startsWith('/rows/')) visited += this.length;
        return Reflect.apply(filter, this, [callback, thisArg]);
      });
    try {
      root.find('/name')!.setValue('after');
      probe('M26 filter visits', visited);
      expect(visited).toBeLessThan(count * 12);
      expect(rows.typeMismatches).toEqual(beforeRows);
      expect(first.typeMismatches).toEqual(beforeFirst);
      expect(rows.typeMismatches).toHaveLength(count);
      expect(first.typeMismatches).toEqual(['/rows/0/addr']);
      const memo = Reflect.get(runtime, 'typeMismatchesMemo') as Map<string, unknown>;
      expect([...memo.keys()].slice(0, 5)).toEqual([
        '', '/rows/0/addr', '/rows/0', '/rows', '/rows/1/addr',
      ]);
    } finally {
      spy.mockRestore();
    }
  });

  it('M27 removes exiting mismatches without scanning the whole set per exit', () => {
    const count = 2000;
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, rows: { type: 'array', items: {
        type: 'object', properties: { child: { type: 'object',
          properties: { value: { type: 'string' } },
          controls: { active: '#/flag' } } },
      } },
    } });
    root.setValue({ flag: true, rows: Array.from({ length: count },
      () => ({ child: 17 })) });
    const child = root.find('/rows/0/child')!;
    const before = child.typeMismatches;
    const mismatchPaths = Reflect.get(runtime, 'typeMismatchPaths') as Set<string>;
    const iterator = mismatchPaths[Symbol.iterator].bind(mismatchPaths);
    let visited = 0;
    const spy = vi.spyOn(mismatchPaths, Symbol.iterator)
      .mockImplementation(() => {
        const source = iterator();
        return {
          next() {
            const result = source.next();
            if (!result.done) visited++;
            return result;
          },
          [Symbol.iterator]() { return this; },
        } as SetIterator<string>;
      });
    try {
      root.find('/flag')!.setValue(false);
      probe('M27 mismatch iteration', visited);
      expect(visited).toBeLessThan(count * 12);
      expect(child.typeMismatches).toEqual(before);
      expect(child.typeMismatch).toBe(true);
      expect(mismatchPaths.size).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('M28 copies a large snapshot container only once for sibling resizes', () => {
    const count = 2000;
    const schema = { type: 'array' as const, items: { type: 'object' as const,
      properties: { tags: { type: 'array' as const,
        items: { type: 'string' as const } } } } };
    const snapshot = Array.from({ length: count }, () => ({ tags: ['a'] }));
    const { root, runtime } = makeSchemaNodeTree(schema, { snapshot });
    root.resetSubtree();
    const iterate = Array.prototype[Symbol.iterator];
    let copiedElements = 0;
    const spy = vi.spyOn(Array.prototype, Symbol.iterator)
      .mockImplementation(function (this: unknown[]) {
        if (this.length === count && this[0] !== null &&
          typeof this[0] === 'object' && 'tags' in this[0])
          copiedElements += this.length;
        return Reflect.apply(iterate, this, []) as ArrayIterator<unknown>;
      });
    try {
      root.setValue(Array.from({ length: count }, () =>
        ({ tags: ['a', 'b'] })));
      probe('M28 copied root elements', copiedElements);
      expect(copiedElements).toBeLessThan(count * 12);
      expect(Reflect.get(runtime, 'loadSnapshot')).toEqual(Array.from({ length: count },
        () => ({ tags: ['a', undefined] })));
    } finally {
      spy.mockRestore();
    }
  });

  it('M28 matches sequential slot alignment for nested and sibling hosts', () => {
    const shared = { tags: ['a'] };
    const snapshot = [shared, { tags: ['b', 'c'] },
      { tags: ['d'] }, { tags: ['e'] }, shared];
    const { root, runtime } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: { tags: { type: 'array',
        items: { type: 'string' } } },
    } }, { snapshot });
    root.resetSubtree();
    root.setValue([{ tags: ['x', 'y'] }, { tags: ['z'] },
      { tags: ['q', 'r', 's'] }, { tags: ['e'] }, { tags: ['a'] }]);
    let sequential: unknown = snapshot;
    for (const [path, slots] of [
      ['/0/tags', ['a', undefined]],
      ['/1/tags', ['b']],
      ['/2/tags', ['d', undefined, undefined]],
    ] as const) sequential = setLoadValue(sequential, path, slots);
    const result = Reflect.get(runtime, 'loadSnapshot') as typeof snapshot;
    expect(result).toEqual(sequential);
    expect(result[0]).not.toBe(snapshot[0]);
    expect(result[1]).not.toBe(snapshot[1]);
    expect(result[3]).toBe(snapshot[3]);
    expect(result[4]).toBe(shared);
  });

  it('M29 indexes declared names for repeated absent gate reads', () => {
    const count = 1000;
    const properties: Record<string, { type: 'string';
      controls: { active: string } }> = {};
    for (let index = 0; index < count; index++)
      properties[`field${index}`] = { type: 'string',
        controls: { active: '#/missing' } };
    const { root } = makeSchemaNodeTree({ type: 'object', properties });
    const some = Array.prototype.some;
    let visited = 0;
    const spy = vi.spyOn(Array.prototype, 'some').mockImplementation(
      function (this: unknown[], callback, thisArg) {
        if (this.length === count && this[0] !== null &&
          typeof this[0] === 'object' && 'name' in this[0])
          visited += this.length;
        return Reflect.apply(some, this, [callback, thisArg]);
      });
    try {
      root.setValue({});
      probe('M29 child entry visits', visited);
      expect(visited).toBeLessThan(count * 12);
    } finally {
      spy.mockRestore();
    }
  });
});
