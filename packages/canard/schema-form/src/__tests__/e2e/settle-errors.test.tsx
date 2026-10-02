import { Component, type ReactNode } from 'react';

import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, ValidationMode, type JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => { form?.unmount(); vi.unstubAllGlobals(); });
const expression: JSONSchema = { type: 'string', controls: { derived: '(() => { throw new Error("derive") })()' } };

it('TEST-020 mount expression errors leave a visible degraded form and report once after commit', async () => {
  const changes = vi.fn();
  const diagnostics = vi.fn();
  form = await renderForm(expression, { validationMode: ValidationMode.None, strictMode: true, onChange: changes, onDiagnosticsChange: diagnostics });
  expect(form.field('')).not.toBeNull();
  expect(form.handle.node?.diagnostics).toMatchObject({ status: 'degraded', cause: 'expression' });
  const codes = form.errorRecords().map(({ code }) => code);
  expect(codes, `committed load records: ${JSON.stringify(codes)}`).toEqual(['SCHEMA_FORM_ERROR.EXPRESSION_THREW']);
  expect(changes).not.toHaveBeenCalled();
  expect(diagnostics).not.toHaveBeenCalled();
  expect(form.sinkErrors().length).toBeGreaterThan(0);
});

it('TEST-020 degraded imperative submission rejects without calling onSubmit', async () => {
  const submit = vi.fn();
  form = await renderForm(expression, { onSubmit: submit });
  await expect(form.handle.submit()).rejects.toMatchObject({ code: 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED' });
  expect(submit).not.toHaveBeenCalled();
});

it('TEST-020 native degraded submit reaches onError and the ownerless sink', async () => {
  form = await renderForm(expression);
  const before = form.sinkErrors().length;
  fireEvent.submit(form.container.querySelector('form')!);
  await waitFor(() => expect(form.errorRecords().some(({ code }) => code === 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED')).toBe(true));
  expect(form.sinkErrors().length).toBeGreaterThan(before);
});

it('TEST-020 root boundary contains render failures and reports the component stack once', async () => {
  const error = new Error('root-render');
  const Broken = (): ReactNode => { throw error; };
  form = await renderForm({ type: 'string' }, { strictMode: true, children: <Broken /> });
  expect(form.errorRecords()).toEqual([expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.RENDER_FAILED', error, componentStack: expect.any(String) })]);
  expect(form.field('')).toBeNull();
});

it('TEST-020 buffered load errors precede a root render failure', async () => {
  const Broken = (): ReactNode => { throw new Error('render'); };
  form = await renderForm(expression, { children: <Broken /> });
  expect(form.errorRecords().map(({ code }) => code)).toEqual(['SCHEMA_FORM_ERROR.EXPRESSION_THREW', 'SCHEMA_FORM_ERROR.RENDER_FAILED']);
});

it('TEST-020 field boundary reports through the instance and preserves sibling inputs', async () => {
  const Broken = (): ReactNode => { throw new Error('field'); };
  form = await renderForm({ type: 'object', properties: { broken: { type: 'string', presentation: { FormTypeInput: Broken } }, sibling: { type: 'string', default: 'kept' } } });
  expect(form.errorRecords().filter(({ code }) => code === 'SCHEMA_FORM_ERROR.RENDER_FAILED')).toHaveLength(1);
  expect(form.value('/sibling')).toBe('kept');
});

it('TEST-020 onError throwing in componentDidCatch reaches the sink without a host boundary', async () => {
  const caught = vi.fn();
  const observerError = new Error('observer');
  class Host extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch(error: Error) { caught(error); }
    render() { return this.state.failed ? <output>host failed</output> : this.props.children; }
  }
  const Broken = (): ReactNode => { throw new Error('child'); };
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, onError: () => { throw observerError; }, children: <Host><Form.Input FormTypeInput={Broken} /></Host> });
  expect(caught).not.toHaveBeenCalled();
  expect(form.sinkErrors().filter((entry) => entry === observerError)).toHaveLength(1);
});

it('TEST-020 validation verdicts do not call onError', async () => {
  form = await renderForm({ type: 'string', minLength: 3 }, { defaultValue: 'x', validator: true });
  expect((await form.validate()).length).toBeGreaterThan(0);
  expect(form.errorRecords()).toEqual([]);
});

it('TEST-020 host onSubmit exceptions go only to the ownerless sink', async () => {
  const error = new Error('host submit');
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, onSubmit: () => { throw error; } });
  fireEvent.submit(form.container.querySelector('form')!);
  await waitFor(() => expect(form.sinkErrors()).toContain(error));
  expect(form.errorRecords()).toEqual([]);
});

it('TEST-020 ownerless sink prefers reportError over console fallback', async () => {
  vi.stubGlobal('reportError', () => {});
  const error = new Error('reportError-path');
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, onSubmit: () => { throw error; } });
  fireEvent.submit(form.container.querySelector('form')!);
  await waitFor(() => expect(form.sinkErrors().filter((entry) => entry === error)).toHaveLength(1));
  expect(form.errorRecords()).toEqual([]);
});

it('TEST-020 ownerless ErrorEvent cancellation prevents a second console report', async () => {
  vi.stubGlobal('reportError', undefined);
  const error = new Error('event-path');
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, onSubmit: () => { throw error; } });
  fireEvent.submit(form.container.querySelector('form')!);
  await waitFor(() => expect(form.sinkErrors().filter((entry) => entry === error)).toHaveLength(1));
});

it('TEST-020 ownerless sink uses console when ErrorEvent is unavailable', async () => {
  vi.stubGlobal('reportError', undefined);
  const error = new Error('console-path');
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, onSubmit: () => { throw error; } });
  vi.stubGlobal('ErrorEvent', undefined);
  fireEvent.submit(form.container.querySelector('form')!);
  await waitFor(() => expect(form.sinkErrors()).toContain(error));
});

it('TEST-020 mount derive budget errors retain a visible form', async () => {
  form = await renderForm({ type: 'object', properties: { left: { type: 'number', controls: { derived: '../right + 1' } }, right: { type: 'number', controls: { derived: '../left + 1' } } } }, { defaultValue: { left: 0, right: 0 } });
  expect(form.handle.node?.diagnostics).toMatchObject({ status: 'degraded', cause: 'budget' });
  expect(form.exists('/left')).toBe(true);
  expect(form.errorRecords().some(({ code }) => code === 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED')).toBe(true);
});

it('TEST-020 mount injection-target errors retain a visible form', async () => {
  form = await renderForm({ type: 'object', properties: { source: { type: 'string', controls: { injectTo: () => ({ '/missing': 'x' }) } } } }, { defaultValue: { source: 'loaded' } });
  expect(form.handle.node?.diagnostics).toMatchObject({ status: 'degraded', cause: 'injectTarget' });
  expect(form.value('/source')).toBe('loaded');
  expect(form.errorRecords().some(({ code }) => code === 'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING')).toBe(true);
});

it('TEST-020 mount shared conflict renders a fallback instead of the conflicting form', async () => {
  form = await renderForm({ type: 'object', properties: { first: { type: 'boolean' }, second: { type: 'boolean' } }, allOf: [
    { controls: { active: './first' }, properties: { shared: { type: 'number' } } },
    { controls: { active: './second' }, properties: { shared: { type: 'string' } } },
  ] }, { defaultValue: { first: true, second: true } });
  expect(form.field('/shared')).toBeNull();
  expect(form.errorRecords().some(({ code }) => code === 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT')).toBe(true);
  expect(form.container.textContent?.length).toBeGreaterThan(0);
});
