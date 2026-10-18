import { afterEach, describe, expect, it, vi } from 'vitest';

import * as blueprint from '@/schema-form/core/engine/blueprint';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  dispatchBatch,
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import * as general from '../utils/arraySlots/canApplyArrayTail';
import * as admission from '../utils/arraySlots/prepareArrayAppend';
import { compareArrayAppend } from './fixtures/compareArrayAppend';

afterEach(() => vi.restoreAllMocks());

describe('extras-only static array appends', () => {
  it.each([
    ['push', 1000],
    ['push', 8000],
    ['insert', 1000],
    ['insert', 8000],
  ] as const)('bounds %s prefix work at %i slots', (verb, count) => {
    const { root } = createDispatchTree({ type: 'array' });
    dispatchMount(root, Array.from({ length: count }, (_, index) => index));
    const prepare = vi.spyOn(admission, 'prepareArrayAppend');
    const entry = vi.spyOn(blueprint, 'getItemEntry');
    const entries = vi.spyOn(blueprint, 'getItemEntries');
    const prefix = vi.spyOn(general, 'canApplyArrayTail');
    const length =
      verb === 'push'
        ? dispatchPush(root, count)
        : dispatchInsert(root, count, count);
    expect(length).toBe(count + 1);
    expect(prepare.mock.results.some(({ value }) => value !== undefined)).toBe(
      true,
    );
    expect(prefix.mock.calls.length).toBeLessThanOrEqual(0);
    expect(entry.mock.calls.length).toBeLessThanOrEqual(4);
    expect(entries.mock.calls.length).toBeLessThanOrEqual(4);
    expect(root.itemCount).toBe(count + 1);
    expect(root.children).toEqual([]);
  });

  it.each(['empty', 'undefined and NaN', 'sparse'])(
    'matches all general-path deliveries from an %s source',
    (scene) => {
      const input = scene === 'empty' ? [] : [1, undefined, NaN];
      if (scene === 'sparse') delete input[1];
      const payload = { untouched: [3, 4] };
      const before = structuredClone(input);
      const { candidate } = compareArrayAppend({ type: 'array' }, input, [
        { apply: (root) => dispatchPush(root, payload), append: true },
        {
          apply: (root) => dispatchInsert(root, root.itemCount, undefined),
          append: true,
        },
        { apply: (root) => dispatchPush(root, 9), append: true },
      ]);
      expect(input).toStrictEqual(before);
      expect(payload).toEqual({ untouched: [3, 4] });
      expect(candidate.local).toEqual([...input, payload, undefined, 9]);
    },
  );

  it('matches host and ancestor deliveries for nested append and insertion', () => {
    compareArrayAppend(
      { type: 'object', properties: { list: { type: 'array' } } },
      { list: [1, 2] },
      [
        {
          apply: (root) => dispatchPush(root.structure!.list, 3),
          append: true,
        },
        {
          apply: (root) => dispatchInsert(root.structure!.list, 3, 4),
          append: true,
        },
      ],
      (root) => root.structure!.list,
    );
  });

  it('publishes new empty children, extras, snapshot and their delivery bits', () => {
    const { root } = createDispatchTree({ type: 'array' });
    dispatchMount(root, [1, 2]);
    const children = root.children;
    const extras = root.undeclaredValues;
    const local = root.local;
    const snapshot = root.runtime.loadSnapshot;
    const revision = root.revisionLedger[FieldNodeEventType.UpdateChildren] ?? 0;
    const delivered: number[] = [];
    subscribeFieldNode(root, ({ type }) => delivered.push(type));
    dispatchPush(root, 3);
    expect(root.children).not.toBe(children);
    expect(root.children).toEqual([]);
    expect(root.undeclaredValues).not.toBe(extras);
    expect(root.local).not.toBe(local);
    expect(root.runtime.loadSnapshot).not.toBe(snapshot);
    expect(children).toEqual([]);
    expect(extras).toEqual([1, 2]);
    expect(local).toEqual([1, 2]);
    expect(snapshot).toEqual([1, 2]);
    expect(
      delivered.some((type) => type & FieldNodeEventType.UpdateChildren),
    ).toBe(true);
    expect(root.revisionLedger[FieldNodeEventType.UpdateChildren]).toBeGreaterThan(
      revision,
    );
  });

  it('keeps dense append snapshots equivalent when the old snapshot is sparse', () => {
    const snapshot = new Array(3);
    snapshot[1] = 'saved';
    const { candidate } = compareArrayAppend({ type: 'array' }, [1, 2, 3], [
      {
        apply: (root) => {
          root.runtime.loadSnapshot = snapshot;
        },
        append: false,
      },
      { apply: (root) => dispatchPush(root, 4), append: true },
    ]);
    expect(candidate.runtime.loadSnapshot).toStrictEqual([
      undefined,
      'saved',
      undefined,
      4,
    ]);
    expect(Object.keys(snapshot)).toEqual(['1']);
  });

  it.each(['tuple tail', 'omitTrailing', 'whole raw', 'batch', 'load'])(
    'retains the %s exclusion',
    (scene) => {
      const schema: BlueprintSchema = {
        type: 'array',
        ...(scene === 'tuple tail'
          ? { prefixItems: [{ type: 'number' }] }
          : {}),
        ...(scene === 'omitTrailing' ? { options: { omitTrailing: true } } : {}),
      };
      compareArrayAppend(schema, scene === 'whole raw' ? 'raw' : [1], [
        {
          apply: (root) => {
            if (scene === 'batch')
              return dispatchBatch(root, () => dispatchPush(root, 2));
            if (scene === 'load') return dispatchMount(root, [1, 2]);
            return dispatchPush(root, 2);
          },
          append: false,
        },
      ]);
    },
  );

  it('retains gates and does not widen pop admission', () => {
    compareArrayAppend(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          list: { type: 'array', controls: { active: '../flag' } },
        },
      },
      { flag: true, list: [1] },
      [
        {
          apply: (root) => dispatchPush(root.structure!.list, 2),
          append: false,
        },
      ],
      (root) => root.structure!.list,
    );
    compareArrayAppend({ type: 'array' }, [1], [
      { apply: (root) => dispatchPop(root), append: false },
    ]);
  });
});
