import { describe, expect, it, vi } from 'vitest';

import { ARRAY_METHOD_ON_NON_ARRAY } from '../../../errors';
import type { FormErrorRecord } from '../../../errors';
import { SchemaNodeEventType } from '../../record';
import { readSchemaNodeErrors } from '../../validation';
import { dispatchBatch, dispatchSetValue, subscribeSchemaNode } from '../index';
import * as dispatch from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-array-entry
describe('array entry integration', () => {
  it('35C-09 NODE-044 perished errors stay frozen after live error stores are pruned', () => {
    const { root, runtime } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [1]);
    const former = getDispatchChild(root, '0');
    dispatch.dispatchSetExternalErrors(former, [{ dataPath: '/0', message: 'retained' }]);
    const previous = readSchemaNodeErrors(former);
    dispatch.dispatchPop(root);
    expect(runtime.nodeErrors?.has(former)).toBe(false);
    expect(readSchemaNodeErrors(former)).toBe(previous);
    dispatch.dispatchPush(root, 2);
    dispatch.dispatchSetExternalErrors(getDispatchChild(root, '0'), [{ dataPath: '/0', message: 'new' }]);
    expect(readSchemaNodeErrors(former)).toBe(previous);
    expect(readSchemaNodeErrors(former)).toEqual([{ dataPath: '/0', message: 'retained' }]);
  });

  it('33C-01 all five entries return settled synchronous results outside a batch', () => {
    const { root } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [1, 2]);
    expect(dispatch.dispatchPush(root, 3)).toBe(3);
    expect(dispatch.dispatchPop(root)).toBe(3);
    expect(dispatch.dispatchUpdate(root, 0, '7')).toBe(7);
    expect(dispatch.dispatchRemove(root, 0)).toBe(7);
    expect(root.local).toEqual([2]);
    expect(dispatch.dispatchClear(root)).toBeUndefined();
    expect(root.local).toEqual([]);
  });

  it('33C-01 exports all five entries and refused entries return undefined', () => {
    const { root, runtime } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [1, 2]);
    const commit = runtime.commitNumber;
    runtime.entryDepth = 1;
    runtime.feedbackBudget = 25;
    runtime.currentListener = () => {};
    expect(dispatch.dispatchPush(root, 3)).toBeUndefined();
    expect(dispatch.dispatchPop(root)).toBeUndefined();
    expect(dispatch.dispatchUpdate(root, 0, 3)).toBeUndefined();
    expect(dispatch.dispatchRemove(root, 0)).toBeUndefined();
    expect(dispatch.dispatchClear(root)).toBeUndefined();
    expect(runtime.commitNumber).toBe(commit);
    expect(runtime.entryDepth).toBe(1);
    expect(root.local).toEqual([1, 2]);
  });

  it('62C-01 EVENT-035 setValue then push reads marks and settles/onChanges once', () => {
    const { root, runtime } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [0]);
    const commit = runtime.commitNumber ?? 0;
    runtime.onChange = vi.fn();
    dispatchBatch(root, () => {
      dispatchSetValue(root, [1, 2]);
      expect(dispatch.dispatchPush(root, 3)).toBe(3);
      expect(root.local).toEqual([0]);
      expect(runtime.commitNumber).toBe(commit);
    });
    expect(root.local).toEqual([1, 2, 3]);
    expect(runtime.commitNumber).toBe(commit + 1);
    expect(runtime.onChange).toHaveBeenCalledExactlyOnceWith([1, 2, 3]);
  });

  it('62C-01 later setValue overrides an earlier array mark', () => {
    const { root } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [1]);
    dispatchBatch(root, () => {
      expect(dispatch.dispatchPush(root, 2)).toBe(2);
      dispatchSetValue(root, [9]);
    });
    expect(root.local).toEqual([9]);
  });

  it('62C-01 pop/remove return marked interpreted raw, including descendant marks', () => {
    const { root } = createDispatchTree({ type: 'array', items: {
      type: 'object', properties: { n: { type: 'number' } },
    } });
    dispatchSetValue(root, [{ n: 1 }, { n: 2 }]);
    const first = getDispatchChild(root, '0');
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(first, 'n'), '7');
      expect(dispatch.dispatchRemove(root, 0)).toEqual({ n: 7 });
      dispatchSetValue(root, [{ n: '8' }, { n: '9' }]);
      expect(dispatch.dispatchPop(root)).toEqual({ n: 9 });
    });
    expect(root.local).toEqual([{ n: 8 }]);
  });

  it('62C-01 update/clear and terminal plans keep synchronous contracts', () => {
    for (const schema of [{ type: 'array', items: { type: 'number' } },
      { type: 'array' }] as const) {
      const { root } = createDispatchTree(schema);
      dispatchSetValue(root, [1, 2]);
      dispatchBatch(root, () => {
        expect(dispatch.dispatchUpdate(root, 0, 7)).toBe(7);
        expect(dispatch.dispatchPop(root)).toBe(2);
        expect(dispatch.dispatchClear(root)).toBeUndefined();
        expect(dispatch.dispatchPush(root, 9)).toBe(1);
      });
      expect(root.local).toEqual([9]);
    }
  });

  it('62C-01 wrong-kind marks only push; other verbs leave the mark unchanged', () => {
    const { root, runtime } = createDispatchTree({ type: 'array', items: { type: 'number' } });
    dispatchSetValue(root, [1, 2]);
    dispatchBatch(root, () => {
      dispatchSetValue(root, null);
      const marks = runtime.batchWrites?.length;
      expect(dispatch.dispatchPop(root)).toBeUndefined();
      expect(dispatch.dispatchRemove(root, 0)).toBeUndefined();
      expect(dispatch.dispatchUpdate(root, 0, 7)).toBeUndefined();
      expect(dispatch.dispatchClear(root)).toBeUndefined();
      expect(runtime.batchWrites?.length).toBe(marks);
      expect(dispatch.dispatchPush(root, 3)).toBe(1);
    });
    expect(root.local).toEqual([3]);
  });

  it('35C-01 non-array errors reach onError with surface thrown', () => {
    const records: FormErrorRecord[] = [];
    const { root } = createDispatchTree({ type: 'string' }, undefined, undefined,
      { hasConsumer: () => true, report: (record) => records.push(record) });
    expect(() => dispatch.dispatchPush(root, 1)).toThrowError(
      expect.objectContaining({ code: `SCHEMA_FORM_ERROR.${ARRAY_METHOD_ON_NON_ARRAY}` }));
    expect(records).toEqual([expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY', surface: 'thrown',
    })]);
  });

  it('62C-01 EVENT-017 non-array throws at chain end after prior marks commit', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      list: { type: 'array', items: { type: 'number' } }, bad: { type: 'string' },
    } });
    dispatchSetValue(root, { list: [1], bad: 'value' });
    const list = getDispatchChild(root, 'list');
    const order: string[] = [];
    root.runtime.onChange = () => order.push('change');
    root.runtime.errorReporter = { hasConsumer: () => true,
      report: () => order.push('error') };
    expect(() => dispatchBatch(root, () => {
      dispatchSetValue(list, [2]);
      dispatch.dispatchPop(getDispatchChild(root, 'bad'));
      order.push('unreachable');
    })).toThrowError(expect.objectContaining({ code: `SCHEMA_FORM_ERROR.${ARRAY_METHOD_ON_NON_ARRAY}` }));
    expect(list.local).toEqual([2]);
    expect(order).toEqual(['change', 'error']);
  });

  it('35C-02 EVENT-068 shifted item and descendant receive previous/current paths', () => {
    const { root } = createDispatchTree({ type: 'array', items: {
      type: 'object', properties: { n: { type: 'number' } },
    } });
    dispatchSetValue(root, [{ n: 1 }, { n: 2 }]);
    const shifted = getDispatchChild(root, '1');
    const leaf = getDispatchChild(shifted, 'n');
    const itemEvents: unknown[] = [];
    const leafEvents: unknown[] = [];
    subscribeSchemaNode(shifted, (event) => {
      if (event.type & SchemaNodeEventType.UpdatePath)
        itemEvents.push(event.payload?.[SchemaNodeEventType.UpdatePath]);
    });
    subscribeSchemaNode(leaf, (event) => {
      if (event.type & SchemaNodeEventType.UpdatePath)
        leafEvents.push(event.payload?.[SchemaNodeEventType.UpdatePath]);
    });
    dispatch.dispatchRemove(root, 0);
    expect(root.children?.[0]).toBe(shifted);
    expect(itemEvents).toEqual([{ previous: '/1', current: '/0' }]);
    expect(leafEvents).toEqual([{ previous: '/1/n', current: '/0/n' }]);
  });

  it('35C-09 warning re-keying keeps one occurrence across feedback and prunes spent keys', () => {
    const records: FormErrorRecord[] = [];
    const { root, runtime } = createDispatchTree({ type: 'array', items: { type: 'number' } },
      undefined, undefined, { hasConsumer: () => true,
        report: (record) => records.push(record) });
    dispatchSetValue(root, [1, 2]);
    let shifted = false;
    subscribeSchemaNode(root, () => {
      if (shifted) return;
      shifted = true;
      dispatch.dispatchRemove(root, 0);
    });
    dispatch.dispatchUpdate(root, 1, { callback: () => {} });
    const nonJsonCode = 'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE';
    expect(records.filter((record) => record.code === nonJsonCode)).toHaveLength(1);
    expect(runtime.warningKeysByPath?.has('/1')).toBe(false);
    expect(runtime.warningKeysByPath?.has('/0')).toBe(true);
    dispatch.dispatchUpdate(root, 0, { callback: () => {} });
    expect(records.filter((record) => record.code === nonJsonCode)).toHaveLength(1);
    dispatch.dispatchPop(root);
    expect(runtime.warningKeysByPath?.has('/0')).toBe(false);
    dispatch.dispatchPush(root, { callback: () => {} });
    expect(records.filter((record) => record.code === nonJsonCode)).toHaveLength(2);
  });
});
