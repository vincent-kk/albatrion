import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type { JsonSchemaError, ValidatorFactory } from '@/schema-form';
import { ValidationMode } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * BUG-1 regression — async validation race.
 *
 * OnChange validation is debounced: the root node's change handler is wrapped in
 * `afterMicrotask` (a cancel-and-reschedule macrotask), so a SYNCHRONOUS burst of
 * value changes coalesces into a SINGLE `validate(finalValue)`. That debounce
 * alone does NOT make validation race-free, because the validator is ASYNC: it
 * only coalesces changes within one macrotask window. A validate started in an
 * EARLIER window (e.g. an earlier edit, or the initial mount validation) whose
 * promise is still pending can resolve LATER and clobber a newer validate's
 * result — leaving a stale error that contradicts the current value.
 *
 * `ValidationManager.validate` guards this with a generation token: a validation
 * whose token is no longer the latest is dropped. These tests force the
 * cross-window race by separating the two changes with a delay so each gets its
 * own debounced validate, with the obsolete one resolving last.
 *
 * The validator's latency is keyed to the value (invalid/short → slow,
 * valid → fast) so the obsolete result tends to land last. The AJV harness
 * validator can't exercise this (it resolves on a microtask), so this uses a
 * custom delayed `validatorFactory`.
 */
const racyValidatorFactory: ValidatorFactory = () =>
  (async (data: any) => {
    const name = typeof data?.name === 'string' ? data.name : '';
    const tooShort = name.length < 3;
    await new Promise((r) => setTimeout(r, tooShort ? 60 : 5));
    return tooShort
      ? ([
          { dataPath: '/name', keyword: 'minLength', message: 'TOO_SHORT' },
        ] as JsonSchemaError[])
      : null;
  }) as ReturnType<ValidatorFactory>;

// Valid default → the initial mount validation is fast and error-free, so the
// race under test is purely between the two edits below.
const schema = {
  type: 'object',
  properties: { name: { type: 'string', default: 'valid' } },
} satisfies JsonSchema;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('async validation race — generation guard (BUG-1 regression)', () => {
  it('an obsolete slow validation does not clobber a newer valid result', async () => {
    const form = await renderForm(schema, {
      validatorFactory: racyValidatorFactory,
      validationMode: ValidationMode.OnChange,
    });
    await form.flush(80); // let the initial mount validation fully settle

    await act(async () => {
      form.handle.setValue({ name: 'ab' }); // invalid → slow (60ms) validation
      await delay(15); // let that validation START (separate macrotask window)
      form.handle.setValue({ name: 'abcd' }); // valid → fast (5ms), supersedes 'ab'
      await delay(120); // 'abcd' resolves first (~20ms), stale 'ab' resolves ~60ms
    });

    // the fresh valid value wins; the obsolete slow validation is dropped.
    expect(form.getValue()?.name).toBe('abcd');
    expect(form.node('/name')?.errors ?? []).toEqual([]);
    expect(form.getErrors().some((e) => e.dataPath === '/name')).toBe(false);
  });

  it('the most recently started validation wins even when it resolves slower', async () => {
    const form = await renderForm(schema, {
      validatorFactory: racyValidatorFactory,
      validationMode: ValidationMode.OnChange,
    });
    await form.flush(80);

    await act(async () => {
      form.handle.setValue({ name: 'abcd' }); // valid → fast, resolves first but is now stale
      await delay(15);
      form.handle.setValue({ name: 'ab' }); // invalid → slow, latest → must win
      await delay(120);
    });

    expect(form.getValue()?.name).toBe('ab');
    expect(
      form
        .getErrors()
        .some((e) => e.dataPath === '/name' && e.keyword === 'minLength'),
    ).toBe(true);
  });
});
