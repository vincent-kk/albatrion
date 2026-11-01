import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { bundleChainErrors } from '../utils/report/bundleChainErrors';
import { collectChainRecords } from '../utils/report/collectChainRecords';
import { deliverChainRecords } from '../utils/report/deliverChainRecords';

// filid:contract dispatch-report
describe('chain failure bundles', () => {
  it('ERROR-005 ERROR-017 preserves occurrence order and the original values', () => {
    const first = new Error('first');
    const second = { raw: true };
    const result = bundleChainErrors([first, second]);
    expect(result).toBeInstanceOf(SchemaFormError);
    if (!(result instanceof SchemaFormError))
      throw new Error('Expected aggregate');
    expect(result.code).toBe(FormErrorCode.MultipleErrors);
    expect(result.details.errors).toEqual([first, second]);
    expect(bundleChainErrors([first])).toBe(first);
  });

  it('ERROR-028 completes deliveries and bundles the handler failure behind the original', () => {
    const first = new Error('listener');
    const handler = new Error('handler');
    const seen: unknown[] = [];
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: (record) => {
          seen.push(record.error);
          if (record.error === first) throw handler;
        },
      },
    );
    subscribeFieldNode(root, () => {
      throw first;
    });
    subscribeFieldNode(root, () => {
      throw new Error('second');
    });
    let caught: unknown;
    try {
      dispatchSetValue(root, 'value');
    } catch (error) {
      caught = error;
    }
    expect(seen).toHaveLength(2);
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError))
      throw new Error('Expected aggregate');
    const components = caught.details.errors;
    expect(components).toEqual([expect.any(SchemaFormError), handler]);
    expect(Array.isArray(components) && components[0]).toBeInstanceOf(
      SchemaFormError,
    );
  });

  it('ERROR-028 a warning-only handler failure is thrown once', () => {
    const error = new Error('handler');
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: () => {
          throw error;
        },
      },
    );
    runtime.pendingWarningRecords = new Map([
      [
        'warning',
        {
          level: 'warning',
          code: 'SCHEMA_FORM_WARNING.MISFIT',
          message: 'warning',
        },
      ],
    ]);
    expect(() => dispatchSetValue(root, 'value')).toThrow(error);
  });

  it('ERROR-028 ownerless delivery sinks handler failure once and continues', () => {
    const original = new Error('original');
    const handler = new Error('handler');
    const seen: string[] = [];
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: (record) => {
          seen.push(record.message);
          if (record.message === 'first') throw handler;
        },
      },
    );
    try {
      const failures = deliverChainRecords(
        runtime,
        [
          {
            level: 'warning',
            code: 'SCHEMA_FORM_WARNING.MISFIT',
            message: 'first',
          },
          {
            level: 'warning',
            code: 'SCHEMA_FORM_WARNING.MISFIT',
            message: 'second',
          },
        ],
        original,
        false,
      );
      expect(failures).toEqual([]);
      expect(seen).toEqual(['first', 'second']);
      expect(sink.mock.calls).toEqual([[handler], [original]]);
    } finally {
      sink.mockRestore();
    }
  });

  it('ERROR-017 ERROR-023 keeps the first error and omits bundles from component records', () => {
    const first = new SchemaFormError(FormErrorCode.GuardFailed, 'first', {
      path: '/a',
    });
    const second = new Error('second');
    const records: {
      error?: unknown;
      origin?: string;
      details?: unknown;
    }[] = [];
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => true, report: (record) => records.push(record) },
    );
    subscribeFieldNode(root, () => {
      throw first;
    });
    subscribeFieldNode(root, () => {
      throw second;
    });
    let thrown: unknown;
    try {
      dispatchSetValue(root, 'value');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaFormError);
    expect(records.map((record) => record.error)).toEqual([first, second]);
    expect(records[0].details).toBe(first.details);
    expect(records.map((record) => record.origin)).toEqual(['write', 'write']);
    for (const record of records)
      expect(record).not.toHaveProperty('aggregate');
  });
  it('A5 keeps the first matching error in each collection and refreshes it in a later collection', () => {
    const first = new SchemaFormError(FormErrorCode.GuardFailed, 'first', {
      schemaPath: '#/if',
    });
    const second = new SchemaFormError(FormErrorCode.GuardFailed, 'second', {
      schemaPath: '#/if',
    });
    const third = new SchemaFormError(FormErrorCode.GuardFailed, 'third', {
      schemaPath: '#/if',
    });
    const stored = {
      level: 'error' as const,
      code: FormErrorCode.GuardFailed,
      message: 'guard',
      schemaPath: '#/if',
      error: undefined as unknown,
      details: undefined as unknown,
    };
    const pending = [stored];
    collectChainRecords(
      pending,
      [
        { kind: 'error', error: first },
        { kind: 'error', error: second },
      ],
      'load',
      undefined,
    );
    expect(stored.error).toBe(first);
    expect(stored.details).toBe(first.details);
    expect(stored).not.toHaveProperty('aggregate');
    collectChainRecords(
      pending,
      [{ kind: 'error', error: third }],
      'load',
      undefined,
    );
    expect(stored.error).toBe(third);
    expect(stored.details).toBe(third.details);
  });
});
