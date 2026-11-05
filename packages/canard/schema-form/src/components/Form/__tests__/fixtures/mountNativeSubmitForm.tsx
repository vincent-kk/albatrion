import { type ReactNode, StrictMode, createRef } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import { observeErrorSink } from '@/schema-form/__tests__/helpers/observeErrorSink';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import type { ValidationIssue } from '@/schema-form/core';
import type {
  FieldInputProps,
  FieldRendererProps,
  JSONSchema,
} from '@/schema-form/types';

import { FormCore, type FormHandle } from '../../components/FormCore';
import { createHeldValidator } from './createHeldValidator';
import { requireKeys } from './requireKeys';

/** Renders each field's input followed by its visible error text under `error:<path>`. */
const Renderer = ({
  Input,
  path,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid={'error:' + path}>
      {errorVisible ? errorMessage : ''}
    </span>
  </>
);

/** Root input: every child field, then the form's submit button. */
const RootWithSubmit = ({ ChildFields }: FieldInputProps) => (
  <>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
    <button type="submit">submit</button>
  </>
);

/** Case options for {@link mountNativeSubmitForm}. */
export interface NativeSubmitFormOptions {
  /** Form schema; two text fields `/a` and `/b` by default. */
  schema?: JSONSchema;
  /** Issue check behind the held validator; `/a` and `/b` required by default. */
  check?: (value: any) => ValidationIssue[];
  /** Form default value. */
  defaultValue?: unknown;
  /** Props spread last onto the Form, overriding the defaults. */
  formProps?: Record<string, unknown>;
  /** Wraps the Form element, for example in a FormProvider. */
  wrap?: (form: ReactNode) => ReactNode;
  /** Render inside `<StrictMode>`. */
  strictMode?: boolean;
  /** Render into a React 18 legacy root. */
  legacyRoot?: boolean;
}

/**
 * Render a Form whose root input ends with a submit button, then observe the host sink, so mount-time
 * output such as React 18's legacy-root deprecation warning is not counted.
 * @param options - Schema, issue check, Form props and wrapping for the case.
 * @returns The handle ref, the render result, the `onError`/`onSubmit` spies (cleared after
 *   mount), the sink and validator controls, a user-event session, DOM finders and
 *   `expectNothingReported()`, which asserts no host report, no onError and no onSubmit.
 */
export const mountNativeSubmitForm = async ({
  schema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'string' } },
  },
  check = requireKeys('a', 'b'),
  defaultValue,
  formProps = {},
  wrap = (form) => form,
  strictMode = false,
  legacyRoot = false,
}: NativeSubmitFormOptions = {}) => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const onSubmit = vi.fn();
  const validator = createHeldValidator(check);
  const tree = wrap(
    <FormCore
      ref={ref}
      jsonSchema={schema}
      defaultValue={defaultValue}
      validatorFactory={validator.validatorFactory}
      FieldRenderer={Renderer}
      formatError={(issue) => issue.message ?? null}
      fieldInputMap={{ '': RootWithSubmit }}
      onError={onError}
      onSubmit={onSubmit}
      {...formProps}
    />,
  );
  const view = render(strictMode ? <StrictMode>{tree}</StrictMode> : tree, {
    legacyRoot,
  });
  const handle = (formProps.ref as typeof ref | undefined) ?? ref;
  await settleValidation(() => handle.current?.node);
  onError.mockClear();
  const sink = observeErrorSink();
  return {
    ref: handle,
    view,
    onError,
    onSubmit,
    sink,
    validator,
    user: userEvent.setup(),
    field: (path: string) =>
      view.container.querySelector<HTMLElement>(`[id="${path}"]`),
    errorText: (path: string) => view.getByTestId('error:' + path).textContent,
    button: () => view.getByRole('button', { name: 'submit' }),
    expectNothingReported: () => {
      expect(
        sink.errors().map((error) => String(error).slice(0, 200)),
        'host channel',
      ).toEqual([]);
      expect(onError, 'onError').not.toHaveBeenCalled();
      expect(onSubmit, 'onSubmit').not.toHaveBeenCalled();
    },
  };
};

/** A form mounted by {@link mountNativeSubmitForm}. */
export type NativeSubmitForm = Awaited<
  ReturnType<typeof mountNativeSubmitForm>
>;
