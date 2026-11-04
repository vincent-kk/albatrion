import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ValidationIssue, ValidatorFactory } from '@/schema-form';
import { ValidationMode } from '@/schema-form';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { settleValidation } from '../helpers/settleValidation';
import { renderForm } from '../renderForm';

/** A valid initial value isolates the race to two explicitly started write slots. */
const schema = {
  type: 'object',
  properties: { name: { type: 'string', default: 'initial' } },
} as const;

/**
 * Retain each write verdict until the test releases it in a chosen order.
 * @returns A validator, its call spy and the independently resolvable write verdicts.
 */
const createRacyValidator = () => {
  const pending = new Map<
    string,
    (issues: readonly ValidationIssue[]) => void
  >();
  const validate = vi.fn((data: any) => {
    const name = String(data.name);
    if (name === 'initial') return null;
    return new Promise<readonly ValidationIssue[]>((resolve) =>
      pending.set(name, resolve),
    );
  });
  const validator: ValidatorFactory = {
    compileGuard: () => () => true,
    compile: () => validate,
  };
  return { validator, validate, pending };
};

describe('async validation race across frame-backed slots', () => {
  it('an obsolete slow validation does not clobber a newer valid result', async () => {
    const { validator, validate, pending } = createRacyValidator();
    const form = await renderForm(schema, {
      validatorFactory: validator,
      validationMode: ValidationMode.OnChange,
    });
    await act(async () => form.handle.setValue({ name: 'ab' }));
    await advanceValidationFrame();
    expect(validate).toHaveBeenLastCalledWith({ name: 'ab' });
    expect(pending.has('ab')).toBe(true);
    await act(async () => form.handle.setValue({ name: 'abcd' }));
    await advanceValidationFrame();
    expect(validate).toHaveBeenLastCalledWith({ name: 'abcd' });
    expect(pending.size).toBe(2);
    await act(async () => pending.get('abcd')!([]));
    await act(async () =>
      pending.get('ab')!([
        { dataPath: '/name', keyword: 'minLength', message: 'TOO_SHORT' },
      ]),
    );
    await settleValidation(() => form.handle.node);
    expect(form.getValue()?.name).toBe('abcd');
    expect(form.node('/name')?.errors ?? []).toEqual([]);
    expect(form.getErrors()).toEqual([]);
  });

  it('the most recently started validation wins even when it resolves slower', async () => {
    const { validator, validate, pending } = createRacyValidator();
    const form = await renderForm(schema, {
      validatorFactory: validator,
      validationMode: ValidationMode.OnChange,
    });
    await act(async () => form.handle.setValue({ name: 'abcd' }));
    await advanceValidationFrame();
    expect(pending.has('abcd')).toBe(true);
    await act(async () => form.handle.setValue({ name: 'ab' }));
    await advanceValidationFrame();
    expect(validate).toHaveBeenLastCalledWith({ name: 'ab' });
    expect(pending.size).toBe(2);
    await act(async () => pending.get('abcd')!([]));
    await act(async () =>
      pending.get('ab')!([
        { dataPath: '/name', keyword: 'minLength', message: 'TOO_SHORT' },
      ]),
    );
    await settleValidation(() => form.handle.node);
    expect(form.getValue()?.name).toBe('ab');
    expect(form.node('/name')?.errors).toEqual([
      { dataPath: '/name', keyword: 'minLength', message: 'TOO_SHORT' },
    ]);
    expect(form.getErrors()).toEqual([
      { dataPath: '/name', keyword: 'minLength', message: 'TOO_SHORT' },
    ]);
  });
});
