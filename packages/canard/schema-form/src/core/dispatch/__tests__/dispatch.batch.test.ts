import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { dispatchBatch, dispatchMount, dispatchResetSubtree,
  dispatchSetValue, subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-batch
describe('dispatcher batch', () => {
  it('EVENT-013 EVENT-014 EVENT-019 and EVENT-035 commit one outer batch', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    let calls = 0;
    subscribeSchemaNode(root, () => { calls += 1; });
    dispatchBatch(root, () => {
      dispatchSetValue(root, 'first');
      expect(root.emit).toBe(undefined);
      dispatchBatch(root, () => dispatchSetValue(root, 'last'));
      expect(root.emit).toBe(undefined);
    });
    expect(root.emit).toBe('last');
    expect(runtime.commitNumber).toBe(1);
    expect(calls).toBe(1);
  });

  it('EVENT-015 and EVENT-072 settle subtree reset immediately inside batch', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' }, sibling: { type: 'string' },
    } }, { child: 'base', sibling: 'kept' });
    dispatchMount(root, { child: 'base', sibling: 'kept' });
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'child'), 'pending');
      dispatchResetSubtree(getDispatchChild(root, 'child'));
      expect(getDispatchChild(root, 'child').emit).toBe('base');
      expect(getDispatchChild(root, 'sibling').emit).toBe('kept');
    });
  });

  it('EVENT-013 applies sibling marks in one settlement', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      left: { type: 'string' }, right: { type: 'string' },
    } });
    dispatchMount(root, { left: 'old', right: 'old' });
    const before = runtime.commitNumber;
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'left'), 'new-left');
      dispatchSetValue(getDispatchChild(root, 'right'), 'new-right');
    });
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
    expect(root.emit).toEqual({ left: 'new-left', right: 'new-right' });
  });

  it('EVENT-017 commits marked writes before rethrowing fn failure', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('batch failed');
    expect(() => dispatchBatch(root, () => {
      dispatchSetValue(root, 'kept');
      throw failure;
    })).toThrow(failure);
    expect(root.emit).toBe('kept');
  });

  it('EVENT-061 treats an updater failure as a callback failure', () => {
    const { root } = createDispatchTree({ type: 'number' });
    const failure = new Error('updater failed');
    expect(() => dispatchBatch(root, () => {
      dispatchSetValue(root, 1);
      dispatchSetValue(root, () => { throw failure; });
      dispatchSetValue(root, 2);
    })).toThrow(failure);
    expect(root.emit).toBe(1);
  });

  it('EVENT-014 propagates a nested callback failure to the outer batch', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('nested failure');
    let continued = false;
    expect(() => dispatchBatch(root, () => {
      dispatchSetValue(root, 'first');
      dispatchBatch(root, () => { throw failure; });
      continued = true;
    })).toThrow(failure);
    expect(continued).toBe(false);
    expect(root.emit).toBe('first');
  });

  it('EVENT-016 listener batch opens its own feedback batch', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    subscribeSchemaNode(root, () => {
      seen.push(String(root.emit));
      if (root.emit === 'first')
        dispatchBatch(root, () => dispatchSetValue(root, 'second'));
    });
    dispatchSetValue(root, 'first');
    expect(seen).toEqual(['first', 'second']);
  });

  it('EVENT-061 updater sees pending writes while ordinary reads stay committed', () => {
    const { root } = createDispatchTree({ type: 'number' });
    dispatchSetValue(root, 1);
    dispatchBatch(root, () => {
      dispatchSetValue(root, (previous: number) => previous + 1);
      dispatchSetValue(root, (previous: number) => previous + 1);
      expect(root.emit).toBe(1);
    });
    expect(root.emit).toBe(3);
  });

  it('EVENT-061 branch updater sees an earlier partial mark over committed values', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      left: { type: 'string' }, right: { type: 'string' },
    } });
    dispatchMount(root, { left: 'old', right: 'kept' });
    const previous: unknown[] = [];
    dispatchBatch(root, () => {
      dispatchSetValue(root, { left: 'new' }, SetValueOption.Merge);
      dispatchSetValue(root, (value: unknown) => {
        previous.push(value);
        return { left: 'new', right: 'last' };
      });
    });
    expect(previous).toEqual([{ left: 'new', right: 'kept' }]);
    expect(root.emit).toEqual({ left: 'new', right: 'last' });
  });

  it('WRITE-015 keeps automatic-write suppression inside batch', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
    } });
    const both = SetValueOption.Overwrite |
      SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites;
    dispatchBatch(root, () => dispatchSetValue(root, {}, both));
    expect(root.structure?.name?.raw).toBeUndefined();
  });
});
