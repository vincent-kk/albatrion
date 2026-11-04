import { StrictMode, createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { settleValidation } from '../helpers/settleValidation';

/** A replacement root must evaluate its own selected validator. */
const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'x' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
} satisfies JSONSchema;
afterEach(cleanup);
// filid:contract conditional-static-load-lifetime
it.each([false, true])(
  'T11 StrictMode=%s keeps one validation wave and finalized callback reads',
  async (strict) => {
    const ref = createRef<FormHandle>();
    const changes = vi.fn();
    const validations = vi.fn(() => {
      expect(ref.current!.findNode('/value')!.jsonSchema).toMatchObject({ minLength: 2 });
      expect(ref.current!.getValue()).toEqual({ kind: 'a', value: 'x' });
    });
    const element = (
      <Form
        ref={ref}
        jsonSchema={schema}
        validatorFactory={plugin.validator}
        onChange={changes}
        onValidate={validations}
      />
    );
    render(strict ? <StrictMode>{element}</StrictMode> : element);
    await settleValidation(() => ref.current?.node);
    expect(changes).not.toHaveBeenCalled();
    expect(validations).toHaveBeenCalledTimes(1);
  },
);
it('T11 absent-to-present validator binding replaces the root under StrictMode', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
      />
    </StrictMode>,
  );
  const prior = ref.current!.node;
  expect(ref.current!.findNode('/value')!.jsonSchema).not.toHaveProperty('minLength');
  await act(async () =>
    view.rerender(
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
          validatorFactory={plugin.validator}
        />
      </StrictMode>,
    ),
  );
  expect(ref.current!.node).not.toBe(prior);
  expect(ref.current!.findNode('/value')!.jsonSchema).toMatchObject({ minLength: 2 });
  expect(ref.current!.getValue()).toEqual({ kind: 'a', value: 'x' });
});
