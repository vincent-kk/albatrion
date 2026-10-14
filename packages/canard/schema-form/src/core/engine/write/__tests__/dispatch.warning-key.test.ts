import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchResetForm } from '../utils/entry/dispatchResetForm';
import { dispatchResetSubtree } from '../utils/entry/dispatchResetSubtree';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dedupeWarningRecord } from '../utils/report/dedupeWarningRecord';

// filid:contract dispatch-report
describe('structural warning keys', () => {
  it('ERROR-024 keys allOf keywords separately and formats only first occurrences', () => {
    const keys = new Set<string>();
    const format = vi.fn((keyword: string) => keyword);
    const warning = (keyword: string) =>
      dedupeWarningRecord(
        keys,
        'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM',
        '#/allOf/0',
        keyword,
        () => format(keyword),
      );
    expect(warning('not')?.message).toBe('not');
    expect(warning('not')).toBeUndefined();
    expect(warning('contains')?.message).toBe('contains');
    expect(format).toHaveBeenCalledTimes(2);
  });

  it('ERROR-204 keeps keys for setValue and resetSubtree, clears for form load', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' }, 'first');
    dispatchMount(root, 'first');
    runtime.warningKeys = new Set(['persistent']);
    dispatchSetValue(root, 'second');
    dispatchResetSubtree(root);
    expect(runtime.warningKeys.has('persistent')).toBe(true);
    dispatchResetForm(root, 'third');
    expect(runtime.warningKeys.has('persistent')).toBe(false);
  });

  it('ERROR-196 ERROR-030 31C-02 omits optional warning work without a consumer', () => {
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => false, report: vi.fn() },
    );
    dispatchMount(root, 'value');
    expect(runtime.warningKeys?.size ?? 0).toBe(0);
  });

  it('ERROR-196 records a reference-only rebuilt reset only for a consumer', () => {
    const prior = createDispatchTree({ type: 'string' });
    prior.runtime.entryDepth = 1;
    const next = createDispatchTree({ type: 'string' }, undefined, undefined, {
      hasConsumer: () => true,
      report: vi.fn(),
    });
    next.runtime.rebuiltReferenceSchemaPaths = ['#/controls/active'];
    adoptFieldNodeChain(prior.root, next.root);
    expect([...(next.runtime.pendingWarningRecords?.values() ?? [])]).toEqual([
      expect.objectContaining({
        code: 'SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE',
        details: { schemaPaths: ['#/controls/active'] },
      }),
    ]);
    const absent = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => false, report: vi.fn() },
    );
    absent.runtime.rebuiltReferenceSchemaPaths = ['#/controls/active'];
    adoptFieldNodeChain(prior.root, absent.root);
    expect(absent.runtime.pendingWarningRecords).toBeUndefined();
  });

  it('VALUE-037 resends MISFIT after the lamp turns off and on', () => {
    const seen: string[] = [];
    const { root } = createDispatchTree(
      { type: 'number' },
      undefined,
      undefined,
      { hasConsumer: () => true, report: (record) => seen.push(record.code) },
    );
    dispatchSetValue(root, 'wrong');
    dispatchSetValue(root, 'still wrong');
    dispatchSetValue(root, 2);
    dispatchSetValue(root, 'wrong again');
    expect(
      seen.filter((code) => code === 'SCHEMA_FORM_WARNING.MISFIT'),
    ).toHaveLength(2);
  });

  it('ERROR-196 detects reference-only schema rebuilding at adoption', () => {
    const previous = createDispatchTree({
      type: 'object',
      controls: { visible: () => true },
    });
    previous.runtime.entryDepth = 1;
    const next = createDispatchTree(
      { type: 'object', controls: { visible: () => true } },
      undefined,
      undefined,
      { hasConsumer: () => true, report: vi.fn() },
    );
    adoptFieldNodeChain(previous.root, next.root);
    expect([...(next.runtime.pendingWarningRecords?.values() ?? [])]).toEqual([
      expect.objectContaining({
        code: 'SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE',
        details: { schemaPaths: ['#/controls/visible'] },
      }),
    ]);
  });

  it('ERROR-196 skips the reference warning when JSON schema data differs', () => {
    const previous = createDispatchTree({
      type: 'object',
      controls: { visible: () => true },
    });
    previous.runtime.entryDepth = 1;
    const next = createDispatchTree(
      {
        type: 'object',
        controls: { visible: () => false },
        properties: { added: { type: 'string' } },
      },
      undefined,
      undefined,
      { hasConsumer: () => true, report: vi.fn() },
    );
    adoptFieldNodeChain(previous.root, next.root);
    expect(next.runtime.pendingWarningRecords?.size ?? 0).toBe(0);
  });

  it('ERROR-024 delivers distinct collected allOf keywords on one field node', () => {
    const keywords: unknown[] = [];
    const { root } = createDispatchTree(
      {
        type: 'object',
        allOf: [
          {
            not: { type: 'string' },
            unevaluatedProperties: false,
          },
        ],
      },
      undefined,
      undefined,
      {
        hasConsumer: () => true,
        report: (record) => {
          if (
            record.code ===
            'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM'
          )
            keywords.push(record.details?.keyword);
        },
      },
    );
    dispatchMount(root, {});
    expect(keywords).toEqual(['not', 'unevaluatedProperties']);
  });
});
