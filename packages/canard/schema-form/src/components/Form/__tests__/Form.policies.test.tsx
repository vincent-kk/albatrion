import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode, type Validator } from '@/schema-form/core';
import { ExternalFormContextProvider } from '@/schema-form/providers/ExternalFormContext';
import type { FormTypeInputProps } from '@/schema-form/types';

import { FormError } from '../components/FormError';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('LANDING-067 REACT-009 combines root locks without blocking imperative writes', () => {
  const ref = createRef<FormHandle>();
  let input: FormTypeInputProps;
  const Component = (props: FormTypeInputProps) => {
    input = props;
    return <input disabled={props.disabled} />;
  };
  render(
    <Form
      ref={ref}
      readOnly
      disabled
      jsonSchema={{ type: 'string' }}
      formTypeInputDefinitions={[{ test: () => true, Component }]}
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
    <Form ref={ref} jsonSchema={schema} validatorFactory={first}>
      <span />
    </Form>,
  );
  const before = ref.current!.node;
  expect(first.compile).toHaveBeenCalledWith(schema);
  view.rerender(
    <Form ref={ref} jsonSchema={schema} validatorFactory={second}>
      <span />
    </Form>,
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
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      onError={() => {}}
      onSubmit={onSubmit}
    >
      <span />
    </Form>,
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
    <ExternalFormContextProvider FormTypeErrorRenderer={ProviderError}>
      <Form jsonSchema={{ type: 'string' }}>
        <FormError />
      </Form>
    </ExternalFormContextProvider>,
  );
  expect(view.container.textContent).toContain('provider-error');
  view.unmount();
  const form = render(
    <ExternalFormContextProvider FormTypeErrorRenderer={ProviderError}>
      <Form
        jsonSchema={{ type: 'string' }}
        FormTypeErrorRenderer={FormErrorRenderer}
      >
        <FormError />
      </Form>
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
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
      onSubmit={() => {
        throw error;
      }}
    >
      <span />
    </Form>,
  );
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(() => expect(sink).toHaveBeenCalledWith(error));
  expect(onError).not.toHaveBeenCalled();
});
