import { act, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SchemaNodeState, SetValueOption, ValidationMode, type FormTypeInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
let input: FormTypeInputProps;
const external = [{ dataPath: '', keyword: 'external', message: 'server' }];
afterEach(() => form?.unmount());

/** Capture consumer callbacks while exposing the real input's draft in the DOM. */
const Probe = (props: FormTypeInputProps) => {
  input = props;
  return <input id={props.path} defaultValue={props.value ?? ''} onChange={(event) => props.onChange(event.target.value, SetValueOption.Overwrite)} />;
};

it('WRITE-083 input value dirty and external-error clearing commit together', async () => {
  const snapshots: unknown[] = [];
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, defaultValue: 'before', errors: external, formTypeInputDefinitions: [{ test: () => true, Component: Probe }] });
  expect(form.handle.node!.errors, 'external errors exist before input').toEqual(external);
  const stop = form.handle.node!.subscribe(() => snapshots.push({ value: form.getValue(), dirty: form.handle.getState()[SchemaNodeState.Dirty], errors: form.getErrors() }));
  await act(async () => input.onChange('after'));
  stop();
  expect(snapshots.length).toBeGreaterThan(0);
  for (const snapshot of snapshots) expect(snapshot).toEqual({ value: 'after', dirty: true, errors: [] });
});

it('LANDING-168 root readOnly rejects input value dirty and error changes', async () => {
  // 79C-01: Form errors applies the whole external list to the root.
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, readOnly: true, defaultValue: 'before', errors: external, formTypeInputDefinitions: [{ test: () => true, Component: Probe }] });
  expect(form.handle.node!.errors, 'external errors exist before blocked input').toEqual(external);
  await act(async () => input.onChange('blocked'));
  expect(form.getValue()).toBe('before');
  expect(form.handle.getState()[SchemaNodeState.Dirty]).not.toBe(true);
  expect(form.handle.node!.errors, 'blocked input preserves node external errors').toEqual(external);
  expect(form.getErrors()).toEqual(external);
  await form.setValue('caller');
  expect(form.value('')).toBe('caller');
});

it('LANDING-168 root disabled rejects input callbacks', async () => {
  form = await renderForm({ type: 'string' }, { disabled: true, defaultValue: 'before', formTypeInputDefinitions: [{ test: () => true, Component: Probe }] });
  await act(async () => input.onChange('blocked'));
  expect(form.getValue()).toBe('before');
  expect(form.handle.getState()[SchemaNodeState.Dirty]).not.toBe(true);
});

it('LANDING-201 input Overwrite retains its own DOM and caret', async () => {
  form = await renderForm({ type: 'string' }, { defaultValue: '', formTypeInputDefinitions: [{ test: () => true, Component: Probe }] });
  const field = form.field('');
  await form.type('', 'abc');
  expect(form.field('')).toBe(field);
  expect((field as HTMLInputElement).selectionStart).toBe(3);
  expect(form.getValue()).toBe('abc');
});

it('TEST-020 replaced input late onChange cannot mutate value dirty or external errors', async () => {
  // 79C-01: Form errors is reapplied to the root after reset.
  form = await renderForm({ type: 'string' }, { validationMode: ValidationMode.None, defaultValue: 'loaded', errors: external, formTypeInputDefinitions: [{ test: () => true, Component: Probe }] });
  expect(form.handle.node!.errors, 'external errors exist before reset').toEqual(external);
  const late = input.onChange;
  await form.reset();
  await act(async () => late('stale'));
  expect(form.getValue()).toBe('loaded');
  expect(form.handle.getState()[SchemaNodeState.Dirty]).not.toBe(true);
  expect(form.handle.node!.errors, 'late input preserves node external errors').toEqual(external);
  expect(form.getErrors()).toEqual(external);
});

it('TEST-020 touched is delivered after blur', async () => {
  form = await renderForm({ type: 'string' }, { defaultValue: 'text' });
  await form.user.click(form.field('')!);
  expect(form.handle.getState()[SchemaNodeState.Touched]).not.toBe(true);
  await form.user.tab();
  await waitFor(() => expect(form.handle.getState()[SchemaNodeState.Touched]).toBe(true));
});

it('WRITE-083 finishInput trims only after blur and retains external errors and dirty', async () => {
  // 79C-01: Form errors uses the root external-error channel.
  form = await renderForm({ type: 'string', options: { trim: true } }, { validationMode: ValidationMode.None, defaultValue: '  loaded  ', errors: external });
  expect(form.handle.node!.errors, 'external errors exist before trim').toEqual(external);
  const field = form.field('');
  expect(form.getValue()).toBe('  loaded  ');
  await form.user.click(field!);
  expect(form.getValue()).toBe('  loaded  ');
  await form.user.tab();
  await form.flush();
  expect(form.getValue()).toBe('loaded');
  expect(form.value('')).toBe('loaded');
  expect(form.field('')).not.toBe(field);
  expect(form.handle.node!.errors, 'trim preserves node external errors').toEqual(external);
  expect(form.getErrors()).toEqual(external);
  expect(form.handle.getState()[SchemaNodeState.Dirty]).not.toBe(true);
});

it('WRITE-083 finishInput on an already trimmed value makes no value write', async () => {
  form = await renderForm({ type: 'string', options: { trim: true } }, { defaultValue: 'clean' });
  const field = form.field('');
  await form.user.click(field!);
  await form.user.tab();
  await form.flush();
  expect(form.changeLog()).toEqual([]);
  expect(form.field('')).toBe(field);
});

it('WRITE-083 automatic write suppression disables trimming', async () => {
  form = await renderForm({ type: 'string', options: { trim: true } }, { defaultValue: '  kept  ', disableAutomaticWrites: true });
  await form.user.click(form.field('')!);
  await form.user.tab();
  await form.flush();
  expect(form.getValue()).toBe('  kept  ');
});
