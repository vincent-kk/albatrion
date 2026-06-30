import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { isValidationError } from '@/schema-form';
import { ValidationMode } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * GAP-18 — Event coalescing / merge dropping a coordinated re-render.
 *
 * Validation drives TWO independent React subscriptions from the same merged
 * node-event batch: `SchemaNodeProxy` (re-renders the `<em>` error text via
 * `errorMessage`, gated by `errorVisible = checkShowError(node.state)`) and
 * `SchemaNodeInput` (the uncontrolled input value). A single value change must
 * update BOTH the displayed value AND the error text together; the node tree's
 * `getErrors()` is the source of truth the DOM must mirror.
 *
 * Load-bearing facts (verified against src/):
 *   - Default `validationMode` is `OnChange | OnRequest`; `ValidationMode.None`
 *     disables the validator entirely (`ValidationManager.enabled === false`).
 *   - `<em>` (FormGroupRenderer) only shows non-empty text when
 *     `errorVisible` is true — every test passes `showError: true`
 *     (→ `ShowError.Always`) so the DOM mirror is observable.
 *   - The default `formatValidationError` resolves `jsonSchema.errorMessages`
 *     by keyword, falling back to the raw AJV message; schemas below pin
 *     deterministic messages so DOM text is exact.
 *   - `Form.onSubmit` runs `rootNode.validate()` and THROWS a `ValidationError`
 *     when errors exist (so `onSubmit` is never invoked on invalid data); with
 *     `ValidationMode.None` the validator is disabled, so submit bypasses it.
 *
 * Every test asserts BOTH layers: rendered DOM (`errorTexts` / `value` /
 * `exists`) AND the node tree (`getErrors()` / `node(path)?.errors` / value).
 */

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories 21.Validation, 13.FormError, 19.SubmitUsecase)
// ---------------------------------------------------------------------------

/** name(minLength) + email(pattern, required) — deterministic error messages. */
const credentialsSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      errorMessages: { minLength: 'NAME_TOO_SHORT' },
    },
    email: {
      type: 'string',
      pattern: '^[^@\\s]+@[^@\\s]+$',
      errorMessages: { pattern: 'BAD_EMAIL', required: 'EMAIL_REQUIRED' },
    },
  },
  required: ['email'],
} satisfies JsonSchema;

/** number range (min/max) with explicit messages. */
const ageSchema = {
  type: 'object',
  properties: {
    age: {
      type: 'number',
      minimum: 18,
      maximum: 99,
      errorMessages: { minimum: 'AGE_TOO_LOW', maximum: 'AGE_TOO_HIGH' },
    },
  },
} satisfies JsonSchema;

/** Mirrors 13.FormError NoValidate / ExternalErrors story schema. */
const externalSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 3, default: 'exceed max length' },
    message: { type: 'string', minLength: 3, default: '1' },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// ValidationMode.OnChange — errors surface in DOM and tree together
// ---------------------------------------------------------------------------

describe('GAP-18 ValidationMode.OnChange — error text mirrors the node tree', () => {
  it('shows minLength error in DOM and tree for an invalid initial value', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'ab', email: 'a@b.com' },
    });
    await form.flush();

    // tree: minLength error on /name
    const nameErrors = form.node('/name')?.errors ?? [];
    expect(nameErrors.some((e) => e.keyword === 'minLength')).toBe(true);
    expect(form.getErrors().some((e) => e.dataPath === '/name')).toBe(true);
    // DOM: the <em> mirrors it
    expect(form.errorTexts()).toContain('NAME_TOO_SHORT');
    expect(form.value('/name')).toBe('ab');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('shows no error text when every value is valid (DOM + tree)', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc', email: 'a@b.com' },
    });
    await form.flush();

    expect(form.getErrors()).toEqual([]);
    expect(form.errorTexts()).toEqual([]);
    expect(form.value('/name')).toBe('abc');
  });

  it('surfaces then clears the error as the user types invalid -> valid', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc', email: 'a@b.com' },
    });
    await form.flush();
    expect(form.errorTexts()).not.toContain('NAME_TOO_SHORT');

    // type invalid -> error appears in BOTH layers from one change
    await form.type('/name', 'ab');
    await form.flush();
    expect(form.value('/name')).toBe('ab');
    expect(
      form.node('/name')?.errors.some((e) => e.keyword === 'minLength'),
    ).toBe(true);
    expect(form.errorTexts()).toContain('NAME_TOO_SHORT');

    // type valid -> error clears in BOTH layers
    await form.type('/name', 'abcd');
    await form.flush();
    expect(form.value('/name')).toBe('abcd');
    expect(form.node('/name')?.errors).toEqual([]);
    expect(form.errorTexts()).not.toContain('NAME_TOO_SHORT');
  });
});

// ---------------------------------------------------------------------------
// ValidationMode comparison: None vs OnRequest
// ---------------------------------------------------------------------------

describe('GAP-18 ValidationMode.None / OnRequest', () => {
  it('None disables validation: no errors in tree or DOM despite invalid value', async () => {
    const form = await renderForm(externalSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.None,
    });
    await form.flush();

    // name default "exceed max length" violates maxLength:3, but validation is off
    expect(form.getErrors()).toEqual([]);
    expect(form.errorTexts()).toEqual([]);
    expect(form.value('/name')).toBe('exceed max length');
    expect(form.node('/name')?.errors).toEqual([]);
  });

  it('OnRequest defers validation: a value change does not error until validate() runs', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnRequest,
      defaultValue: { name: 'abc', email: 'a@b.com' },
    });
    await form.flush();

    // typing an invalid value does NOT trigger validation under OnRequest
    await form.type('/name', 'ab');
    await form.flush();
    expect(form.value('/name')).toBe('ab');
    expect(form.node('/name')?.errors).toEqual([]);
    expect(form.errorTexts()).not.toContain('NAME_TOO_SHORT');

    // explicit validate() surfaces the error in BOTH layers
    const errors = await form.validate();
    await form.flush();
    expect(errors.some((e) => e.dataPath === '/name')).toBe(true);
    expect(
      form.node('/name')?.errors.some((e) => e.keyword === 'minLength'),
    ).toBe(true);
    expect(form.errorTexts()).toContain('NAME_TOO_SHORT');
  });
});

// ---------------------------------------------------------------------------
// External errors prop (13.FormError ExternalErrors)
// ---------------------------------------------------------------------------

describe('GAP-18 external errors prop', () => {
  it('renders an externally-supplied error in DOM and exposes it in the tree', async () => {
    const form = await renderForm(externalSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.None,
      errors: [
        {
          keyword: 'maxLength',
          dataPath: '/message',
          details: { limit: 20 },
          message: 'should NOT be longer than 20 characters',
        },
      ],
    });
    await form.flush();

    // tree: the /message node carries the external error
    const messageErrors = form.node('/message')?.errors ?? [];
    expect(
      messageErrors.some((e) =>
        (e.message ?? '').includes('should NOT be longer'),
      ),
    ).toBe(true);
    // DOM: the <em> mirrors it
    expect(
      form.errorTexts().some((t) => t.includes('should NOT be longer')),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// submit() (19.SubmitUsecase)
// ---------------------------------------------------------------------------

describe('GAP-18 submit() validation gate', () => {
  it('resolves and calls onSubmit when the value is valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc', email: 'a@b.com' },
      onSubmit,
    });
    await form.flush();
    expect(form.getErrors()).toEqual([]);

    await act(async () => {
      await form.handle.submit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'abc', email: 'a@b.com' }),
    );
    expect(form.errorTexts()).toEqual([]);
  });

  it('rejects with a ValidationError and never calls onSubmit when invalid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc' }, // missing required email
      onSubmit,
    });
    await form.flush();

    let caught: unknown = null;
    await act(async () => {
      try {
        await form.handle.submit();
      } catch (e) {
        caught = e;
      }
    });

    expect(isValidationError(caught)).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
    // tree: required error on /email; DOM mirrors it (showError: true)
    expect(
      form
        .getErrors()
        .some((e) => e.dataPath === '/email' && e.keyword === 'required'),
    ).toBe(true);
    expect(form.errorTexts()).toContain('EMAIL_REQUIRED');
  });

  it('None mode bypasses the submit validation gate (onSubmit runs on invalid data)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.None,
      defaultValue: { name: 'abc' }, // missing required email
      onSubmit,
    });
    await form.flush();

    await act(async () => {
      await form.handle.submit();
    });

    // validation disabled -> no gate, onSubmit invoked, no errors anywhere
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(form.getErrors()).toEqual([]);
    expect(form.errorTexts()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Keyword coverage: required / pattern / min-max
// ---------------------------------------------------------------------------

describe('GAP-18 keyword coverage (DOM + tree)', () => {
  it('required: missing field errors on its own path in DOM and tree', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc' },
    });
    await form.flush();

    expect(
      form.node('/email')?.errors.some((e) => e.keyword === 'required'),
    ).toBe(true);
    expect(
      form
        .getErrors()
        .some((e) => e.dataPath === '/email' && e.keyword === 'required'),
    ).toBe(true);
    expect(form.errorTexts()).toContain('EMAIL_REQUIRED');
  });

  it('pattern: an invalid email shows the pattern message in DOM and tree', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc', email: 'not-an-email' },
    });
    await form.flush();

    expect(
      form.node('/email')?.errors.some((e) => e.keyword === 'pattern'),
    ).toBe(true);
    expect(form.getErrors().some((e) => e.dataPath === '/email')).toBe(true);
    expect(form.errorTexts()).toContain('BAD_EMAIL');
  });

  it('min/max: number range error tracks the value across two invalid states', async () => {
    const form = await renderForm(ageSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { age: 5 },
    });
    await form.flush();

    // below minimum
    expect(form.node('/age')?.errors.some((e) => e.keyword === 'minimum')).toBe(
      true,
    );
    expect(form.errorTexts()).toContain('AGE_TOO_LOW');
    expect(form.value('/age')).toBe('5');

    // above maximum -> message flips, value mirrors
    await form.type('/age', '200');
    await form.flush();
    expect(form.value('/age')).toBe('200');
    expect(form.node('/age')?.errors.some((e) => e.keyword === 'maximum')).toBe(
      true,
    );
    expect(form.errorTexts()).toContain('AGE_TOO_HIGH');
    expect(form.errorTexts()).not.toContain('AGE_TOO_LOW');

    // valid -> all errors clear in BOTH layers
    await form.type('/age', '30');
    await form.flush();
    expect(form.value('/age')).toBe('30');
    expect(form.node('/age')?.errors).toEqual([]);
    expect(form.errorTexts()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GAP-18 coordinated value + error re-render from a single edit
// ---------------------------------------------------------------------------

describe('GAP-18 coordinated value + error from one change', () => {
  it('a single edit updates the input value AND error text together', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'abc', email: 'a@b.com' },
    });
    await form.flush();
    expect(form.errorTexts()).toEqual([]);

    // ONE change must reflect in both the value mirror and the error mirror
    await form.type('/email', 'broken');
    await form.flush();
    expect(form.value('/email')).toBe('broken');
    expect(
      form.node('/email')?.errors.some((e) => e.keyword === 'pattern'),
    ).toBe(true);
    expect(form.errorTexts()).toContain('BAD_EMAIL');
    // value and error stayed coordinated (no split-brain)
    expect(form.getValue()?.email).toBe('broken');
  });

  it('clearing the offending field removes the error while preserving siblings', async () => {
    const form = await renderForm(credentialsSchema, {
      validator: true,
      showError: true,
      validationMode: ValidationMode.OnChange,
      defaultValue: { name: 'ab', email: 'a@b.com' },
    });
    await form.flush();
    expect(form.errorTexts()).toContain('NAME_TOO_SHORT');

    // fix /name; /email remains valid and present, error clears in both layers
    await form.type('/name', 'alice');
    await form.flush();
    expect(form.value('/name')).toBe('alice');
    expect(form.value('/email')).toBe('a@b.com');
    expect(form.node('/name')?.errors).toEqual([]);
    expect(form.getErrors()).toEqual([]);
    expect(form.errorTexts()).toEqual([]);
  });
});
