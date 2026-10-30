import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { readFieldNodeErrors } from '@/schema-form/core/engine/validation';
import { FormErrorCode } from '@/schema-form/errors';
import type { FormErrorRecord } from '@/schema-form/errors';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchClear } from '../utils/entry/dispatchClear';
import { dispatchInsert } from '../utils/entry/dispatchInsert';
import { dispatchPop } from '../utils/entry/dispatchPop';
import { dispatchPush } from '../utils/entry/dispatchPush';
import { dispatchRemove } from '../utils/entry/dispatchRemove';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchUpdate } from '../utils/entry/dispatchUpdate';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-array-entry
describe('array entry integration', () => {
  it('35C-09 NODE-044 perished errors stay frozen after live error stores are pruned', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1]);
    const former = getDispatchChild(root, '0');
    dispatchSetExternalErrors(former, [
      { dataPath: '/0', message: 'retained' },
    ]);
    const previous = readFieldNodeErrors(former);
    dispatchPop(root);
    expect(runtime.nodeErrors?.has(former)).toBe(false);
    expect(readFieldNodeErrors(former)).toBe(previous);
    dispatchPush(root, 2);
    dispatchSetExternalErrors(getDispatchChild(root, '0'), [
      { dataPath: '/0', message: 'new' },
    ]);
    expect(readFieldNodeErrors(former)).toBe(previous);
    expect(readFieldNodeErrors(former)).toEqual([
      { dataPath: '/0', message: 'retained' },
    ]);
  });

  it('33C-01 all five entries return settled synchronous results outside a batch', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1, 2]);
    expect(dispatchPush(root, 3)).toBe(3);
    expect(dispatchPop(root)).toBe(3);
    expect(dispatchUpdate(root, 0, '7')).toBe(7);
    expect(dispatchRemove(root, 0)).toBe(7);
    expect(root.local).toEqual([2]);
    expect(dispatchClear(root)).toBeUndefined();
    expect(root.local).toEqual([]);
  });

  it('33C-01 exports all five entries; refused push returns the current length and the others undefined', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1, 2]);
    const commit = runtime.commitNumber;
    runtime.entryDepth = 1;
    runtime.feedbackBudget = 25;
    runtime.currentListener = () => {};
    expect(dispatchPush(root, 3)).toBe(2);
    expect(dispatchPop(root)).toBeUndefined();
    expect(dispatchUpdate(root, 0, 3)).toBeUndefined();
    expect(dispatchRemove(root, 0)).toBeUndefined();
    expect(dispatchClear(root)).toBeUndefined();
    expect(runtime.commitNumber).toBe(commit);
    expect(runtime.entryDepth).toBe(1);
    expect(root.local).toEqual([1, 2]);
  });

  it('62C-01 EVENT-035 setValue then push reads marks and settles/onChanges once', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [0]);
    const commit = runtime.commitNumber ?? 0;
    runtime.onChange = vi.fn();
    dispatchBatch(root, () => {
      dispatchSetValue(root, [1, 2]);
      expect(dispatchPush(root, 3)).toBe(3);
      expect(root.local).toEqual([0]);
      expect(runtime.commitNumber).toBe(commit);
    });
    expect(root.local).toEqual([1, 2, 3]);
    expect(runtime.commitNumber).toBe(commit + 1);
    expect(runtime.onChange).toHaveBeenCalledExactlyOnceWith([1, 2, 3]);
  });

  it('62C-01 later setValue overrides an earlier array mark', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1]);
    dispatchBatch(root, () => {
      expect(dispatchPush(root, 2)).toBe(2);
      dispatchSetValue(root, [9]);
    });
    expect(root.local).toEqual([9]);
  });

  it('62C-01 pop/remove return marked interpreted raw, including descendant marks', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: {
        type: 'object',
        properties: { n: { type: 'number' } },
      },
    });
    dispatchSetValue(root, [{ n: 1 }, { n: 2 }]);
    const first = getDispatchChild(root, '0');
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(first, 'n'), '7');
      expect(dispatchRemove(root, 0)).toEqual({ n: 7 });
      dispatchSetValue(root, [{ n: '8' }, { n: '9' }]);
      expect(dispatchPop(root)).toEqual({ n: 9 });
    });
    expect(root.local).toEqual([{ n: 8 }]);
  });

  it('62C-01 update/clear and terminal plans keep synchronous contracts', () => {
    for (const schema of [
      { type: 'array', items: { type: 'number' } },
      { type: 'array' },
    ] as const) {
      const { root } = createDispatchTree(schema);
      dispatchSetValue(root, [1, 2]);
      dispatchBatch(root, () => {
        expect(dispatchUpdate(root, 0, 7)).toBe(7);
        expect(dispatchPop(root)).toBe(2);
        expect(dispatchClear(root)).toBeUndefined();
        expect(dispatchPush(root, 9)).toBe(1);
      });
      expect(root.local).toEqual([9]);
    }
  });

  it('62C-01 wrong-kind marks only push; other verbs leave the mark unchanged', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1, 2]);
    dispatchBatch(root, () => {
      dispatchSetValue(root, null);
      const marks = runtime.batchWrites?.length;
      expect(dispatchPop(root)).toBeUndefined();
      expect(dispatchRemove(root, 0)).toBeUndefined();
      expect(dispatchUpdate(root, 0, 7)).toBeUndefined();
      expect(dispatchClear(root)).toBeUndefined();
      expect(runtime.batchWrites?.length).toBe(marks);
      expect(dispatchPush(root, 3)).toBe(1);
    });
    expect(root.local).toEqual([3]);
  });

  it('35C-01 non-array errors reach onError with surface thrown', () => {
    const records: FormErrorRecord[] = [];
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => true, report: (record) => records.push(record) },
    );
    expect(() => dispatchPush(root, 1)).toThrowError(
      expect.objectContaining({
        code: FormErrorCode.ArrayMethodOnNonArray,
      }),
    );
    expect(records).toEqual([
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
        surface: 'thrown',
      }),
    ]);
  });

  it('62C-01 EVENT-017 non-array throws at chain end after prior marks commit', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'number' } },
        bad: { type: 'string' },
      },
    });
    dispatchSetValue(root, { list: [1], bad: 'value' });
    const list = getDispatchChild(root, 'list');
    const order: string[] = [];
    root.runtime.onChange = () => order.push('change');
    root.runtime.errorReporter = {
      hasConsumer: () => true,
      report: () => order.push('error'),
    };
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(list, [2]);
        dispatchPop(getDispatchChild(root, 'bad'));
        order.push('unreachable');
      }),
    ).toThrowError(
      expect.objectContaining({
        code: FormErrorCode.ArrayMethodOnNonArray,
      }),
    );
    expect(list.local).toEqual([2]);
    expect(order).toEqual(['change', 'error']);
  });

  it('35C-02 EVENT-068 shifted item and descendant receive previous/current paths', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: {
        type: 'object',
        properties: { n: { type: 'number' } },
      },
    });
    dispatchSetValue(root, [{ n: 1 }, { n: 2 }]);
    const shifted = getDispatchChild(root, '1');
    const leaf = getDispatchChild(shifted, 'n');
    const itemEvents: unknown[] = [];
    const leafEvents: unknown[] = [];
    subscribeFieldNode(shifted, (event) => {
      if (event.type & FieldNodeEventType.UpdatePath)
        itemEvents.push(event.payload?.[FieldNodeEventType.UpdatePath]);
    });
    subscribeFieldNode(leaf, (event) => {
      if (event.type & FieldNodeEventType.UpdatePath)
        leafEvents.push(event.payload?.[FieldNodeEventType.UpdatePath]);
    });
    dispatchRemove(root, 0);
    expect(root.children?.[0]).toBe(shifted);
    expect(itemEvents).toEqual([{ previous: '/1', current: '/0' }]);
    expect(leafEvents).toEqual([{ previous: '/1/n', current: '/0/n' }]);
  });

  it('35C-09 warning re-keying keeps one occurrence across feedback and prunes spent keys', () => {
    const records: FormErrorRecord[] = [];
    const { root, runtime } = createDispatchTree(
      { type: 'array', items: { type: 'number' } },
      undefined,
      undefined,
      { hasConsumer: () => true, report: (record) => records.push(record) },
    );
    dispatchSetValue(root, [1, 2]);
    let shifted = false;
    subscribeFieldNode(root, () => {
      if (shifted) return;
      shifted = true;
      dispatchRemove(root, 0);
    });
    dispatchUpdate(root, 1, { callback: () => {} });
    const nonJsonCode = 'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE';
    expect(
      records.filter((record) => record.code === nonJsonCode),
    ).toHaveLength(1);
    expect(runtime.warningKeysByPath?.has('/1')).toBe(false);
    expect(runtime.warningKeysByPath?.has('/0')).toBe(true);
    dispatchUpdate(root, 0, { callback: () => {} });
    expect(
      records.filter((record) => record.code === nonJsonCode),
    ).toHaveLength(1);
    dispatchPop(root);
    expect(runtime.warningKeysByPath?.has('/0')).toBe(false);
    dispatchPush(root, { callback: () => {} });
    expect(
      records.filter((record) => record.code === nonJsonCode),
    ).toHaveLength(2);
  });

  it('33C-01 insert returns the settled length, and refused or out-of-range calls the current length', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1, 2]);
    expect(dispatchInsert(root, 1, 9)).toBe(3);
    expect(dispatchInsert(root, -1, 9)).toBe(3);
    expect(dispatchInsert(root, 4, 9)).toBe(3);
    expect(root.local).toEqual([1, 9, 2]);
    const commit = runtime.commitNumber;
    runtime.entryDepth = 1;
    runtime.feedbackBudget = 25;
    runtime.currentListener = () => {};
    expect(dispatchInsert(root, 0, 7)).toBe(3);
    expect(runtime.commitNumber).toBe(commit);
    expect(root.local).toEqual([1, 9, 2]);
  });

  it('62C-01 insert and remove mixed in one batch return call-site results and settle once', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1, 2, 3]);
    const commit = runtime.commitNumber ?? 0;
    const first = getDispatchChild(root, '0');
    runtime.onChange = vi.fn();
    dispatchBatch(root, () => {
      expect(dispatchInsert(root, 1, 9)).toBe(4);
      expect(dispatchRemove(root, 0)).toBe(1);
      expect(dispatchInsert(root, 3, 7)).toBe(4);
      expect(dispatchInsert(root, 9, 0)).toBe(4);
      expect(dispatchInsert(root, 0.5, 0)).toBe(4);
      expect(dispatchRemove(root, 1)).toBe(2);
      expect(dispatchInsert(root, 0, '5')).toBe(4);
      expect(root.local).toEqual([1, 2, 3]);
      expect(runtime.commitNumber).toBe(commit);
    });
    expect(root.local).toEqual([5, 9, 3, 7]);
    expect(runtime.commitNumber).toBe(commit + 1);
    expect(runtime.onChange).toHaveBeenCalledExactlyOnceWith([5, 9, 3, 7]);
    expect(getDispatchChild(root, '0')).toBe(first);
  });

  it('62C-01 47C-02 batch insert on a marked non-array value follows push only at index 0', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchSetValue(root, [1]);
    dispatchBatch(root, () => {
      dispatchSetValue(root, null);
      expect(dispatchInsert(root, 1, 2)).toBe(0);
      expect(dispatchInsert(root, 0, 2)).toBe(1);
      expect(dispatchInsert(root, 1, 3)).toBe(2);
    });
    expect(root.local).toEqual([2, 3]);
  });
});
