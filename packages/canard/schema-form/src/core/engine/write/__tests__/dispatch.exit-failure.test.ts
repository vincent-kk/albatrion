import { describe, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchVisitSubtree } from '../utils/entry/dispatchVisitSubtree';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

/** Recovery includes public delivery and the next operation's failure, not only runtime counters. */
const expectRecovery = (root: DispatchTestNode) => {
  const runtime = root.runtime;
  runtime.errorReporter = undefined;
  runtime.listeners?.clear();
  runtime.onStateChange = undefined;
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(root, event);
  runtime.onChange = onChange;
  const value =
    typeof root.local === 'string'
      ? 'recovered independently'
      : { recovered: true };
  dispatchSetValue(root, value);
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(value);
  const failure = new Error('later independent failure');
  expect(() =>
    dispatchSetValue(root, () => {
      throw failure;
    }),
  ).toThrow(failure);
};

// filid:contract dispatch-report
describe('chain exit failure recovery', () => {
  it('closes the chain when an external error getter throws during root aggregation', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'string' } },
    });
    dispatchMount(root, { a: 'old' });
    const child = getDispatchChild(root, 'a');
    const failure = new Error('external dataPath');
    const order: string[] = [];
    runtime.errorReporter = {
      hasConsumer: () => true,
      report: () => {
        order.push('report');
      },
    };
    runtime.onChange = () => {
      order.push('onChange');
    };
    dispatchSetExternalErrors(root, [
      {
        get dataPath(): string {
          throw failure;
        },
        message: 'external',
      },
    ]);
    expect(() =>
      dispatchBatch(root, () => {
        dispatchSetValue(child, 'committed');
        dispatchSetExternalErrors(child, [
          { dataPath: '/a', message: 'child' },
        ]);
      }),
    ).toThrow(failure);
    expect(order).toEqual(['onChange', 'report']);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainRoot).toBeUndefined();
    expect(runtime.chainErrors).toBeUndefined();
    dispatchSetExternalErrors(root, []);
    const onChange = vi.fn();
    runtime.onChange = onChange;
    dispatchSetValue(child, 'recovered');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('closes mount when a retained adopted external error array becomes unreadable', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('retained error array');
    const errors = new Proxy([], {
      get() {
        throw failure;
      },
    });
    runtime.validationMode = ValidationMode.None;
    runtime.adoptedExternalErrors = new Map([['', errors]]);
    const order: string[] = [];
    runtime.errorReporter = {
      hasConsumer: () => true,
      report: () => {
        order.push('report');
      },
    };
    runtime.onChange = () => {
      order.push('onChange');
    };
    expect(() => dispatchMount(root, 'mounted')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.mountingGuardPass).toBe(false);
    expect(order).toEqual(['onChange', 'report']);
    expectRecovery(root);
  });

  it('closes mount when its reporter consumer check throws', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('consumer check');
    runtime.errorReporter = {
      hasConsumer: () => {
        throw failure;
      },
      report: vi.fn(),
    };
    expect(() => dispatchMount(root, 'mounted')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.mountingGuardPass).toBe(false);
    expectRecovery(root);
  });

  it('restores collectors when hasConsumer throws while capturing a listener failure', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const failure = new Error('listener consumer check');
    let failConsumer = false;
    runtime.errorReporter = {
      hasConsumer: () => {
        if (failConsumer) throw failure;
        return true;
      },
      report: vi.fn(),
    };
    const unsubscribe = subscribeFieldNode(root, () => {
      failConsumer = true;
      throw new Error('listener');
    });
    expect(() => dispatchSetValue(root, 'next')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(runtime.chainRoot).toBeUndefined();
    expect(runtime.currentListener).toBeUndefined();
    unsubscribe();
    runtime.errorReporter = undefined;
    const onChange = vi.fn();
    runtime.onChange = onChange;
    dispatchSetValue(root, 'recovered');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  });

  it('restores collectors and budget when hasConsumer throws after an onChange failure', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const failure = new Error('onChange consumer check');
    let failConsumer = false;
    runtime.errorReporter = {
      hasConsumer: () => {
        if (failConsumer) throw failure;
        return true;
      },
      report: vi.fn(),
    };
    runtime.onChange = () => {
      failConsumer = true;
      throw new Error('onChange');
    };
    expect(() => dispatchSetValue(root, 'next')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(runtime.chainRoot).toBeUndefined();
    expect(runtime.onChangeBudget).toBe(0);
    runtime.errorReporter = undefined;
    runtime.onChange = vi.fn();
    dispatchSetValue(root, 'recovered');
    expect(runtime.onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  });

  it('exits a batch even when capturing the flush error throws in hasConsumer', () => {
    const { root, runtime } = createDispatchTree({ type: 'object' });
    dispatchMount(root, {});
    const failure = new Error('flush consumer check');
    runtime.errorReporter = {
      hasConsumer: () => {
        throw failure;
      },
      report: vi.fn(),
    };
    expect(() =>
      dispatchBatch(root, () =>
        dispatchSetValue(
          root,
          new Proxy(
            {},
            {
              ownKeys() {
                throw new Error('flush');
              },
            },
          ),
          WriteOption.Merge,
        ),
      ),
    ).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expectRecovery(root);
  });

  it('exits a visit batch even when capturing the flush error throws in hasConsumer', () => {
    const { root, runtime } = createDispatchTree({ type: 'object' });
    dispatchMount(root, {});
    const failure = new Error('visit consumer check');
    runtime.errorReporter = {
      hasConsumer: () => {
        throw failure;
      },
      report: vi.fn(),
    };
    expect(() =>
      dispatchVisitSubtree(root, () =>
        dispatchSetValue(
          root,
          new Proxy(
            {},
            {
              ownKeys() {
                throw new Error('flush');
              },
            },
          ),
          WriteOption.Merge,
        ),
      ),
    ).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expectRecovery(root);
  });

  it('clears the origin if a reporter consumer check throws during record delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const failure = new Error('delivery consumer check');
    let checkingDelivery = false;
    runtime.errorReporter = {
      hasConsumer: () => {
        if (checkingDelivery) throw failure;
        return true;
      },
      report: vi.fn(),
    };
    subscribeFieldNode(root, () => {
      throw new Error('listener');
    });
    runtime.onChange = () => {
      checkingDelivery = true;
    };
    expect(() => dispatchSetValue(root, 'next')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(runtime.chainOrigin).toBeUndefined();
    expectRecovery(root);
  });

  it('already exits ordinary listener and onChange failures in delivery then report order', () => {
    const order: string[] = [];
    const report = vi.fn(() => order.push('report'));
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => true, report },
    );
    dispatchMount(root, 'old');
    report.mockClear();
    order.length = 0;
    const listener = new Error('listener');
    const callback = new Error('callback');
    subscribeFieldNode(root, () => {
      order.push('listener');
      throw listener;
    });
    runtime.onChange = () => {
      order.push('onChange');
      throw callback;
    };
    expect(() => dispatchSetValue(root, 'next')).toThrow();
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(order).toEqual(['listener', 'onChange', 'report', 'report']);
  });

  it('continues queued delivery, validation and onChange after a listener causes aggregation failure', () => {
    const order: string[] = [];
    const failure = new Error('queued external path');
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'string' } },
    });
    dispatchMount(root, { a: 'old' });
    const child = getDispatchChild(root, 'a');
    runtime.errorReporter = {
      hasConsumer: () => true,
      report: (record) => {
        expect(record.error).toBe(failure);
        order.push('report');
      },
    };
    runtime.validationMode = ValidationMode.OnChange;
    runtime.validationCadence = {
      request: () => {
        order.push('validation');
      },
      cancel: () => undefined,
    };
    runtime.onChange = () => {
      order.push('onChange');
    };
    let first = true;
    subscribeFieldNode(root, () => {
      order.push('event');
      if (!first) return;
      first = false;
      dispatchSetExternalErrors(root, [
        {
          get dataPath(): string {
            throw failure;
          },
          message: 'external',
        },
      ]);
      dispatchSetExternalErrors(child, [{ dataPath: '/a', message: 'child' }]);
    });
    expect(() => dispatchSetValue(child, 'next')).toThrow(failure);
    expect(order).toEqual([
      'event',
      'event',
      'validation',
      'onChange',
      'report',
    ]);
    expect(runtime.entryDepth).toBe(0);
  });

  it('does not report an enclosed callback chain reporter failure through its outer load', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('nested consumer');
    let failConsumer = false;
    const report = vi.fn();
    runtime.validationMode = ValidationMode.None;
    runtime.errorReporter = {
      hasConsumer: () => {
        if (failConsumer) {
          failConsumer = false;
          throw failure;
        }
        return true;
      },
      report,
    };
    subscribeFieldNode(root, () => {
      if (root.local !== 'nested') return;
      failConsumer = true;
      throw new Error('nested listener');
    });
    runtime.onChange = () => {
      if (root.local === 'mounted') dispatchSetValue(root, 'nested');
    };
    expect(() => dispatchMount(root, 'mounted')).toThrow(failure);
    expect(report).not.toHaveBeenCalled();
    expect(runtime.entryDepth).toBe(0);
    expectRecovery(root);
  });

  it('preserves a reporter failure while unwinding a failed mount restore', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('restore consumer');
    let failConsumer = false;
    runtime.validationMode = ValidationMode.None;
    runtime.adoptedExternalErrors = new Map([
      [
        '',
        new Proxy([], {
          get() {
            failConsumer = true;
            throw new Error('restore');
          },
        }),
      ],
    ]);
    runtime.errorReporter = {
      hasConsumer: () => {
        if (failConsumer) throw failure;
        return true;
      },
      report: vi.fn(),
    };
    expect(() => dispatchMount(root, 'mounted')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(runtime.mountingGuardPass).toBe(false);
    expectRecovery(root);
  });

  it('resets validation entry state when an injected validation scheduler throws before callbacks', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const failure = new Error('validation scheduling');
    runtime.validationMode = ValidationMode.OnChange;
    runtime.validationCadence = {
      request: () => {
        throw failure;
      },
      cancel: () => undefined,
    };
    expect(() => dispatchSetValue(root, 'next')).toThrow(failure);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.chainErrors).toBeUndefined();
    expect(runtime.validationPendingEntryStamp).toBeUndefined();
    expect(runtime.validationTargets).toBeUndefined();
    expect(runtime.deferLoadValidation).toBeUndefined();
    expect(runtime.validationPending).toBe(false);
    runtime.validationMode = ValidationMode.None;
    runtime.validationCadence = undefined;
    const onChange = vi.fn();
    runtime.onChange = onChange;
    dispatchSetValue(root, 'recovered');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
    expectRecovery(root);
  });
});
