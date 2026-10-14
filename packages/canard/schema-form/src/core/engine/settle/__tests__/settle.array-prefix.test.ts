import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { PathKeyedMap } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedMap';

import { compareArrayTail } from './fixtures/compareArrayTail';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-array-prefix
describe('array prefix settlement matches the general path', () => {
  it('appends nested items, retaining prefix paths and filling only new descendants', () => {
    const { actual, former } = compareArrayTail(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            fill: { type: 'number', default: 7 },
            nested: {
              type: 'array',
              items: {
                type: 'object',
                properties: { leaf: { type: 'string' } },
              },
            },
          },
        },
      },
      [{ name: 'old', nested: [{}, {}] }],
      { kind: 'push', value: { name: 'new' } },
      undefined,
      undefined,
      true,
    );
    expect(actual.children![0]).toBe(former[0]);
    expect(actual.local).toEqual([
      { name: 'old', fill: 7, nested: [{}, {}] },
      { name: 'new', fill: 7 },
    ]);
  });

  it('removes the last item and preserves detached reads and prefix state', () => {
    const { actual, former, result } = compareArrayTail(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      [{ name: 'kept' }, { name: 'removed' }],
      { kind: 'remove', index: 1 },
      (root) => {
        root.children![0].interactionState = { touched: true };
      },
      undefined,
      true,
    );
    expect(result).toEqual({ name: 'removed' });
    expect(actual.children![0]).toBe(former[0]);
    expect(former[1].detached).toBe(true);
    expect(former[1].local).toEqual({ name: 'removed' });
  });

  it('captures identical detached reads for a removed item that watches and has a load snapshot', () => {
    const { former, actual } = compareArrayTail(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            n: { type: 'number' },
            w: { type: 'number', controls: { watch: ['../n'] } },
          },
        },
      },
      [
        { n: 1, w: 2 },
        { n: 3, w: 4 },
      ],
      { kind: 'pop' },
      undefined,
      undefined,
      true,
    );
    expect(actual.runtime.detachedReads?.get(former[1])).toBeDefined();
    expect(former[1].detached).toBe(true);
  });

  it('falls back for a middle removal that shifts descendant paths', () => {
    const { actual, former } = compareArrayTail(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      { kind: 'remove', index: 0 },
      undefined,
      undefined,
      false,
    );
    expect(actual.children![0]).toBe(former[1]);
    expect(actual.children![0].children![0].path).toBe('/0/name');
  });

  it('appends multiple value slots and removes multiple trailing slots', () => {
    compareArrayTail(
      { type: 'array', items: { type: 'string' } },
      ['a'],
      { kind: 'push', value: 'unused' },
      undefined,
      {
        kind: 'slots',
        slots: [{ from: 0 }, { value: 'b' }, { value: 'c' }],
        result: { source: 'length' },
      },
      true,
    );
    const { actual, former } = compareArrayTail(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b', 'c'],
      { kind: 'pop' },
      undefined,
      {
        kind: 'slots',
        slots: [{ from: 0 }],
        result: { source: 'removed', index: 2 },
      },
      true,
    );
    expect(actual.children![0]).toBe(former[0]);
    expect(former.slice(1).every((node) => node.detached)).toBe(true);
  });

  it('keeps tuple extras and dense undefined slots through append and pop', () => {
    const schema: BlueprintSchema = {
      type: 'array',
      prefixItems: [{ type: 'string' }],
      items: false,
    };
    compareArrayTail(
      schema,
      ['a', undefined, 'tail'],
      { kind: 'push', value: 'next' },
      undefined,
      undefined,
      true,
    );
    const { actual, result } = compareArrayTail(
      schema,
      ['a', undefined, 'tail'],
      { kind: 'pop' },
      undefined,
      undefined,
      true,
    );
    expect(actual.undeclaredValues).toEqual([undefined]);
    expect(result).toBe('tail');
    expect(Object.keys(actual.runtime.loadSnapshot!)).toEqual(['0', '1']);
  });

  it('densifies a sparse or short load snapshot without changing the original', () => {
    const sparse: unknown[] = [];
    sparse.length = 2;
    sparse[1] = 'snapshot';
    const { actual } = compareArrayTail(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b'],
      { kind: 'push', value: 'c' },
      (root) => {
        root.runtime.loadSnapshot = sparse;
      },
      undefined,
      true,
    );
    expect(actual.runtime.loadSnapshot).toEqual([undefined, 'snapshot', 'c']);
    expect(Object.keys(sparse)).toEqual(['1']);
    compareArrayTail(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b'],
      { kind: 'pop' },
      (root) => {
        root.runtime.loadSnapshot = [];
      },
      undefined,
      true,
    );
  });

  it('retains gated descendants and the gate evaluation order', () => {
    const schema: BlueprintSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          hidden: { type: 'string', controls: { active: '../show' } },
        },
      },
    };
    const input = [
      { show: false, hidden: 'secret' },
      { show: true, hidden: 'visible' },
    ];
    compareArrayTail(
      schema,
      input,
      { kind: 'push', value: { show: false, hidden: 'new' } },
      undefined,
      undefined,
      true,
    );
    compareArrayTail(
      schema,
      input,
      { kind: 'pop' },
      undefined,
      undefined,
      true,
    );
  });

  it('falls back for push onto a gated-out prefix', () => {
    compareArrayTail(
      {
        type: 'array',
        items: { type: 'string', controls: { active: 'false' } },
      },
      ['secret'],
      { kind: 'push', value: 'new' },
      undefined,
      undefined,
      false,
    );
  });

  it('pops the only gated-out slot through the tail path, returning its latent source', () => {
    const { result } = compareArrayTail(
      {
        type: 'array',
        items: { type: 'string', controls: { active: 'false' } },
      },
      ['secret'],
      { kind: 'pop' },
      undefined,
      undefined,
      true,
    );
    expect(result).toBe('secret');
  });

  it('clears all tail slots through the tail path and handles wrong-kind append through the general route', () => {
    compareArrayTail(
      { type: 'array', items: { type: 'number' } },
      [1, 2],
      { kind: 'clear' },
      undefined,
      undefined,
      true,
    );
    compareArrayTail(
      { type: 'array', items: { type: 'number' } },
      null,
      { kind: 'push', value: 3 },
      undefined,
      undefined,
      false,
    );
  });

  it('prunes out-of-range latent sources before a newly appended item enters', () => {
    compareArrayTail(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hidden: { type: 'string' },
          },
        },
      },
      [{}],
      { kind: 'push', value: {} },
      (root) => {
        root.runtime.latentRaw.set(
          JSON.stringify(['/1/hidden', 'string']),
          'obsolete',
        );
        root.runtime.misfitPaths.add('/1/hidden');
      },
      undefined,
      true,
    );
  });

  it('removes rules with a tail source or target and invalidates intersecting memos', () => {
    compareArrayTail(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b'],
      { kind: 'pop' },
      (root) => {
        root.runtime.committedRuleValues = new PathKeyedMap('rule', [
          [
            JSON.stringify([
              '/0',
              'string',
              1,
              '/rule',
              'target',
              '/1',
              'string',
              2,
            ]),
            'target-tail',
          ],
          [
            JSON.stringify([
              '/1',
              'string',
              1,
              '/rule',
              'target',
              '/0',
              'string',
              2,
            ]),
            'source-tail',
          ],
        ]);
        root.runtime.misfitsMemo = new PathKeyedMap('path', [
          ['', { commit: 1, paths: ['/1'] }],
        ]);
        root.runtime.inactiveValuesMemo.set('', [
          { path: '/1', value: 'secret' },
        ]);
        root.runtime.latentRaw.set(
          JSON.stringify(['/1/hidden', 'string']),
          'secret',
        );
      },
      undefined,
      true,
    );
  });
});
