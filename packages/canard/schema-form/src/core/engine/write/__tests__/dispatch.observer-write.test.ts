import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import {
  FormErrorCode,
  FormWarningCode,
  SchemaFormError,
} from '@/schema-form/errors';

import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { reportOwnerlessError } from '../utils/report/reportOwnerlessError';

// filid:contract dispatch-report
describe('observer write boundary', () => {
  it('keeps live writes blocked after a detached warning is reported inside an error observer', () => {
    const seen: unknown[] = [];
    let observing = false;
    const { root } = createDispatchTree(
      {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          leaf: { type: 'string', controls: { active: '../open' } },
          other: { type: 'string' },
        },
      },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: (record) => {
          if (!observing || record.code === FormWarningCode.DetachedNodeWrite)
            return;
          dispatchSetValue(old, 'x');
          try {
            dispatchSetValue(other, 'blocked');
          } catch (error) {
            seen.push(error);
          }
        },
      },
    );
    dispatchMount(root, { open: true, leaf: 'a', other: 'b' });
    const old = root.structure!.leaf;
    const other = root.structure!.other;
    dispatchSetValue(root.structure!.open, false);
    observing = true;
    subscribeFieldNode(root, () => {
      throw new Error('listener');
    });
    expect(() => dispatchSetValue(other, 'value')).toThrow();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBeInstanceOf(SchemaFormError);
    if (!(seen[0] instanceof SchemaFormError))
      throw new Error('Expected write failure');
    expect(seen[0].code).toBe(FormErrorCode.WriteInObserver);
    expect(other.local).toBe('value');
  });
  it('ERROR-029 WRITE-099 rejects a same-form write immediately without recursion', () => {
    const seen: unknown[] = [];
    const failure = new Error('listener');
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: () => {
          try {
            dispatchSetValue(root, 'blocked');
          } catch (error) {
            seen.push(error);
          }
        },
      },
    );
    subscribeFieldNode(root, () => {
      throw failure;
    });
    expect(() => dispatchSetValue(root, 'value')).toThrow(failure);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBeInstanceOf(SchemaFormError);
    if (!(seen[0] instanceof SchemaFormError))
      throw new Error('Expected write failure');
    expect(seen[0].code).toBe(FormErrorCode.WriteInObserver);
    expect(root.emit).toBe('value');
  });

  it('ERROR-029 allows writes on another form while reporting', () => {
    const other = createDispatchTree({ type: 'string' });
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: () => dispatchSetValue(other.root, 'allowed'),
      },
    );
    subscribeFieldNode(root, () => {
      throw new Error('listener');
    });
    expect(() => dispatchSetValue(root, 'source')).toThrow();
    expect(other.root.emit).toBe('allowed');
  });

  it('ERROR-008 ownerless fallback reports once without Node emission', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('ownerless');
    try {
      reportOwnerlessError(failure);
      expect(spy).toHaveBeenCalledWith(failure);
    } finally {
      spy.mockRestore();
    }
  });

  it('ERROR-008 prefers window.reportError over console', () => {
    const reportError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal('window', { reportError });
    const failure = new Error('browser');
    try {
      reportOwnerlessError(failure);
      expect(reportError).toHaveBeenCalledExactlyOnceWith(failure);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleError.mockRestore();
    }
  });

  it('ERROR-008 uses ErrorEvent and respects cancellation', () => {
    /** Minimal browser event constructor for the ownerless branch. */
    class ErrorEventStub {
      /** Error carried to the browser observer. */
      readonly error: unknown;
      constructor(_type: string, options: { error: unknown }) {
        this.error = options.error;
      }
    }
    const dispatchEvent = vi.fn(() => false);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('ErrorEvent', ErrorEventStub);
    const failure = new Error('event');
    try {
      reportOwnerlessError(failure);
      expect(dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ error: failure }),
      );
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      consoleError.mockRestore();
    }
  });
});
