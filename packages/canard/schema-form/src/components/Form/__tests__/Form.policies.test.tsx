import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode, type Validator } from '@/schema-form/core';
import { ExternalFormContextProvider } from '@/schema-form/providers/ExternalFormContext';
import type { FieldInputProps } from '@/schema-form/types';

import { ErrorBoundedFormCore } from '../components/FormCore/ErrorBoundedFormCore';
import type { FormHandle } from '../components/FormCore/type';
import { FormError } from '../components/FormError/FormError';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('LANDING-067 REACT-009 combines root locks without blocking imperative writes', () => {
  const ref = createRef<FormHandle>();
  let input: FieldInputProps;
  const Component = (props: FieldInputProps) => {
    input = props;
    return <input disabled={props.disabled} />;
  };
  render(
    <ErrorBoundedFormCore
      ref={ref}
      readOnly
      disabled
      jsonSchema={{ type: 'string' }}
      fieldInputDefinitions={[{ test: () => true, Component }]}
    />,
  );
  act(() => input!.onChange('blocked'));
  expect(ref.current!.getValue()).toBeUndefined();
  act(() => ref.current!.setValue('allowed'));
  expect(ref.current!.getValue()).toBe('allowed');
  expect(input!.readOnly && input!.disabled).toBe(true);
});

it('VALIDATE-044 retains authored schema identity and replaces the root on validator change', () => {
  const first: Validator = {
    compile: vi.fn(() => () => []),
    compileGuard: () => () => true,
  };
  const second: Validator = {
    compile: vi.fn(() => () => []),
    compileGuard: () => () => true,
  };
  const schema = { type: 'string' } as const;
  const ref = createRef<FormHandle>();
  const view = render(
    <ErrorBoundedFormCore
      ref={ref}
      jsonSchema={schema}
      validatorFactory={first}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  const before = ref.current!.node;
  expect(first.compile).toHaveBeenCalledWith(schema);
  view.rerender(
    <ErrorBoundedFormCore
      ref={ref}
      jsonSchema={schema}
      validatorFactory={second}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  expect(ref.current!.node).not.toBe(before);
  expect(second.compile).toHaveBeenCalledWith(schema);
});

it('LANDING-095 VALIDATE-044 rejects unavailable validation when validation is enabled', async () => {
  const validator: Validator = {
    compile: () => {
      throw new Error('compile');
    },
    compileGuard: () => () => true,
  };
  const ref = createRef<FormHandle>();
  const onSubmit = vi.fn();
  render(
    <ErrorBoundedFormCore
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      onError={() => {}}
      onSubmit={onSubmit}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  await expect(ref.current!.submit()).rejects.toMatchObject({
    code: 'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED',
  });
  expect(onSubmit).not.toHaveBeenCalled();
});

it('LANDING-067 resolves specialized renderers through Form then FormProvider', () => {
  const ProviderError = () => <span>provider-error</span>;
  const FormErrorRenderer = () => <span>form-error</span>;
  const view = render(
    <ExternalFormContextProvider FormErrorRenderer={ProviderError}>
      <ErrorBoundedFormCore jsonSchema={{ type: 'string' }}>
        <FormError />
      </ErrorBoundedFormCore>
    </ExternalFormContextProvider>,
  );
  expect(view.container.textContent).toContain('provider-error');
  view.unmount();
  const form = render(
    <ExternalFormContextProvider FormErrorRenderer={ProviderError}>
      <ErrorBoundedFormCore
        jsonSchema={{ type: 'string' }}
        FormErrorRenderer={FormErrorRenderer}
      >
        <FormError />
      </ErrorBoundedFormCore>
    </ExternalFormContextProvider>,
  );
  expect(form.container.textContent).toContain('form-error');
});

it('ERROR-026 ERROR-117 sends a host onSubmit exception only to the unowned sink', async () => {
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const error = new Error('host submit');
  const onError = vi.fn();
  const view = render(
    <ErrorBoundedFormCore
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
      onSubmit={() => {
        throw error;
      }}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(() => expect(sink).toHaveBeenCalledWith(error));
  expect(onError).not.toHaveBeenCalled();
});
