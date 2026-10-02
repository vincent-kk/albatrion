import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form, SchemaNodeState, SetValueOption, ValidationMode,
  type FormHandle, type FormTypeInputProps, type ValidatorFactory,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-025 settlement failure commits and notifies the caller value before throwing', async () => {
  form = await renderForm({ type: 'object', properties: {
    source: { type: 'number' },
    target: { type: 'number', controls: { derived: '../source > 0 ? (() => { throw new Error("derive") })() : 0' } },
  } }, { defaultValue: { source: 0 }, validationMode: ValidationMode.None });
  await act(async () => {
    expect(() => form.node('/source')!.setValue(1)).toThrow();
    expect(form.getValue()).toEqual({ source: 1, target: 0 });
    expect(form.lastValue()).toEqual({ source: 1, target: 0 });
  });
  expect(form.value('/source')).toBe('1');
  expect(form.errorRecords()).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.EXPRESSION_THREW' }),
  ]));
});

it('LANDING-025 compile failure rejects validation and submission', async () => {
  const submit = vi.fn();
  form = await renderForm({ type: 'string' }, { onSubmit: submit,
    validationMode: ValidationMode.OnRequest,
    validatorFactory: { compile: () => { throw new Error('compile'); }, compileGuard: () => () => true },
  });
  await expect(form.handle.validate()).rejects.toMatchObject({ code: 'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED' });
  await expect(form.handle.submit()).rejects.toMatchObject({ code: 'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED' });
  expect(submit).not.toHaveBeenCalled();
});

it('LANDING-036 validatorFactory compiles validation and synchronous guards', async () => {
  const compile = vi.fn(() => () => []);
  const compileGuard = vi.fn(() => (value: unknown) => Boolean((value as { flag?: boolean }).flag));
  const validatorFactory: ValidatorFactory = { compile, compileGuard };
  form = await renderForm({ type: 'object', properties: { flag: { type: 'boolean' } },
    if: { properties: { flag: { const: true } } },
    then: { properties: { name: { type: 'string', default: 'shown' } } },
  }, { validatorFactory, defaultValue: { flag: false } });
  expect(form.exists('/name')).toBe(false);
  await form.toggle('/flag');
  expect(form.value('/name')).toBe('shown');
  expect(compile).toHaveBeenCalledTimes(1);
  expect(compileGuard).toHaveBeenCalledTimes(1);
});

it('LANDING-039 same-schema reset retains nodes clears state and refreshes only inputs', async () => {
  form = await renderForm({ type: 'object', properties: { name: { type: 'string' } } }, {
    defaultValue: { name: 'loaded' }, validationMode: ValidationMode.None, instrument: true,
  });
  const root = form.handle.node;
  const child = form.node('/name');
  const wrapper = form.wrapper('');
  await form.type('/name', 'edited');
  await act(async () => form.handle.setState({ [SchemaNodeState.Dirty]: true }));
  const input = form.field('/name');
  await form.reset();
  expect(form.handle.node).toBe(root);
  expect(form.node('/name')).toBe(child);
  expect(form.wrapper('')).toBe(wrapper);
  expect(form.field('/name')).not.toBe(input);
  expect(form.handle.getState()).toEqual({});
  expect(form.value('/name')).toBe('loaded');
  const before = form.changeLog().length;
  await form.reset();
  expect(form.changeLog()).toHaveLength(before);
});

it('LANDING-039 changed-schema reset switches the handle before returning', () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: 'string' }} defaultValue="old" />);
  try {
    const previous = ref.current!.node;
    view.rerender(<Form ref={ref} jsonSchema={{ type: 'number' }} defaultValue={7} />);
    expect(ref.current!.node).toBe(previous);
    act(() => {
      ref.current!.reset();
      expect(ref.current!.node).not.toBe(previous);
      expect(ref.current!.getValue()).toBe(7);
    });
    expect(view.container.querySelector('input')?.value).toBe('7');
  } finally { view.unmount(); }
});

it('LANDING-041 OnRequest skips mount and reset validation while OnChange runs once', async () => {
  const validate = vi.fn(() => []);
  const validatorFactory: ValidatorFactory = { compile: () => validate, compileGuard: () => () => true };
  form = await renderForm({ type: 'string' }, { validatorFactory, validationMode: ValidationMode.OnRequest });
  expect(validate).not.toHaveBeenCalled();
  await form.reset();
  expect(validate).not.toHaveBeenCalled();
  form.unmount();
  form = await renderForm({ type: 'string' }, { validatorFactory, validationMode: ValidationMode.OnChange });
  expect(validate).toHaveBeenCalledTimes(1);
  await form.reset();
  expect(validate).toHaveBeenCalledTimes(2);
});

it('LANDING-044 onError observes mismatch warnings without replacing the value', async () => {
  form = await renderForm({ type: 'number' }, { validationMode: ValidationMode.None });
  await form.setValue('unconvertible');
  expect(form.getValue()).toBe('unconvertible');
  expect(form.errorRecords()).toEqual(expect.arrayContaining([
    expect.objectContaining({ level: 'warning', code: 'SCHEMA_FORM_WARNING.TYPE_MISMATCH' }),
  ]));
  expect(form.handle.node?.typeMismatch).toBe(true);
});

it('LANDING-045 degraded diagnostics survive writes and subtree reset and reject submit', async () => {
  const submit = vi.fn();
  form = await renderForm({ type: 'object', properties: {
    source: { type: 'string', controls: { derived: '(() => { throw new Error("derive") })()' } },
    other: { type: 'string' },
  } }, { onSubmit: submit, validationMode: ValidationMode.None });
  const diagnostics = form.handle.node!.diagnostics;
  expect(diagnostics).toMatchObject({ status: 'degraded', cause: 'expression', commit: expect.any(Number) });
  await act(async () => {
    form.node('/other')!.setValue('next');
    form.node('/other')!.resetSubtree();
  });
  expect(form.handle.node!.diagnostics).toBe(diagnostics);
  await expect(form.handle.submit()).rejects.toMatchObject({ code: 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED' });
  expect(submit).not.toHaveBeenCalled();
});

it('LANDING-046 field render failures are isolated and reported with componentStack', async () => {
  const error = new Error('broken input');
  const Broken = (): never => { throw error; };
  form = await renderForm({ type: 'object', properties: {
    broken: { type: 'string', presentation: { FormTypeInput: Broken } },
    sibling: { type: 'string', default: 'kept' },
  } });
  expect(form.value('/sibling')).toBe('kept');
  expect(form.field('/broken')).toBeNull();
  expect(form.errorRecords()).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.RENDER_FAILED', error, componentStack: expect.any(String) }),
  ]));
  expect(form.sinkErrors().length).toBeGreaterThan(0);
});

it('LANDING-140 input Merge retains its own DOM instance', async () => {
  const Input = ({ path, value, onChange }: FormTypeInputProps) =>
    <input id={path} defaultValue={value ?? ''} onChange={(event) => onChange(event.target.value, SetValueOption.Merge)} />;
  form = await renderForm({ type: 'string' }, {
    formTypeInputDefinitions: [{ test: () => true, Component: Input }],
  });
  const field = form.field('')!;
  await form.user.type(field, 'next');
  expect(form.field('')).toBe(field);
  expect(form.getValue()).toBe('next');
});
