import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, SchemaNodeEventType, type FormTypeInputProps, type FormTypeRendererProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-199 external replacement refreshes changed inputs and preserves unchanged inputs', async () => {
  form = await renderForm({ type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } }, { defaultValue: { a: 'old', b: 'kept' }, instrument: true });
  const a = form.field('/a');
  const b = form.field('/b');
  const root = form.wrapper('');
  await form.setValue({ a: 'new', b: 'kept' });
  expect(form.value('/a')).toBe('new');
  expect(form.field('/a')).not.toBe(a);
  expect(form.field('/b')).toBe(b);
  expect(form.wrapper('')).toBe(root);
});

it('EVENT-002 unchanged content produces no phantom UpdateValue delivery', async () => {
  form = await renderForm({ type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } }, { defaultValue: { a: 'same', b: 'same' } });
  const deliveries: string[] = [];
  const stops = ['', '/a', '/b'].map((path) => form.node(path)!.subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) deliveries.push(path); }));
  await act(async () => form.handle.node!.batch(() => { form.node('/a')!.setValue('temporary'); form.node('/a')!.setValue('same'); }));
  stops.forEach((stop) => stop());
  expect(form.getValue()).toEqual({ a: 'same', b: 'same' });
  expect(deliveries, 'P-25: content restored to the previous commit must not deliver UpdateValue').toEqual([]);
  expect(form.changeLog()).toEqual([]);
});

it('LANDING-042 a terminal object refreshes while the ordinary object wrapper remains', async () => {
  const Terminal = ({ value }: FormTypeInputProps) => <input id="/box" defaultValue={JSON.stringify(value)} />;
  form = await renderForm({ type: 'object', properties: { box: { type: 'object', presentation: { FormTypeInput: Terminal } } } }, { defaultValue: { box: { n: 1 } } });
  const root = form.wrapper('');
  const input = form.field('/box');
  await form.setValue({ box: { n: 2 } });
  expect(form.wrapper('')).toBe(root);
  expect(form.field('/box')).not.toBe(input);
  expect(form.value('/box')).toBe('{"n":2}');
});

it('EVENT-073 refresh remounts the addressed input and retains its node', async () => {
  form = await renderForm({ type: 'object', properties: { text: { type: 'string' } } }, { defaultValue: { text: 'same' } });
  const node = form.node('/text');
  const input = form.field('/text');
  await act(async () => form.handle.refresh('/text'));
  expect(form.node('/text')).toBe(node);
  expect(form.field('/text')).not.toBe(input);
  expect(form.value('/text')).toBe('same');
});

it('TEST-020 FormGroupRenderer consumes node.strategy for branch and terminal rendering', async () => {
  const Group = ({ node, Input }: FormTypeRendererProps) => <section data-strategy={node.strategy}><Input /></section>;
  form = await renderForm({ type: 'object', properties: { text: { type: 'string' }, list: { type: 'array', items: { type: 'string' } } } }, { defaultValue: { text: 'ok', list: ['one'] }, FormTypeGroupRenderer: Group });
  expect(form.container.querySelector('[data-strategy="branch"]')).not.toBeNull();
  expect(form.value('/text')).toBe('ok');
  expect(form.value('/list/0')).toBe('one');
});

it('LANDING-039 render-prop output and nested input show the same settled value', async () => {
  let renders = 0;
  form = await renderForm({ type: 'object', properties: { text: { type: 'string' } } }, { defaultValue: { text: '' }, children: ({ value }) => { renders++; return <><output>{JSON.stringify(value)}</output><Form.Input path="/text" /></>; } });
  const before = renders;
  await form.user.type(form.field('/text')!, 'x');
  expect(renders - before).toBe(1);
  expect(form.container.querySelector('output')?.textContent).toBe(JSON.stringify(form.getValue()));
  expect(form.value('/text')).toBe('x');
});

it('LANDING-022 non-function children keep their element while subscriptions update', async () => {
  form = await renderForm({ type: 'object', properties: { text: { type: 'string' } } }, { defaultValue: { text: 'old' }, children: <><span data-static="yes">static</span><Form.Input path="/text" /></> });
  const fixed = form.container.querySelector('[data-static]');
  await form.setValue({ text: 'new' });
  expect(form.container.querySelector('[data-static]')).toBe(fixed);
  expect(form.value('/text')).toBe('new');
});

it('LANDING-199 derived target refreshes after source input without replacing the source', async () => {
  form = await renderForm({ type: 'object', properties: { source: { type: 'string' }, target: { type: 'string', controls: { derived: '../source' } } } }, { defaultValue: { source: 'a' } });
  const source = form.field('/source');
  const target = form.field('/target');
  await form.type('/source', 'b');
  expect(form.field('/source')).toBe(source);
  expect(form.field('/target')).not.toBe(target);
  expect(form.value('/target')).toBe('b');
});

it('SETTLE-043 restoring source content makes no phantom watch or derived delivery', async () => {
  form = await renderForm({ type: 'object', properties: { source: { type: 'string' }, target: { type: 'string', controls: { derived: '../source' } }, watcher: { type: 'string', controls: { watch: ['../source'] } } } }, { defaultValue: { source: 'same' } });
  const events: { path: string; value: unknown; watch: readonly unknown[] }[] = [];
  const stops = ['/target', '/watcher'].map((path) => form.node(path)!.subscribe((event) => { if (event.type & (SchemaNodeEventType.UpdateValue | SchemaNodeEventType.UpdateComputedProperties)) events.push({ path, value: form.node(path)!.value, watch: form.node(path)!.watchValues }); }));
  const before = form.getValue();
  await act(async () => form.handle.node!.batch(() => { form.node('/source')!.setValue('temporary'); form.node('/source')!.setValue('same'); }));
  stops.forEach((stop) => stop());
  expect(form.getValue()).toEqual(before);
  expect(events, 'P-25: unchanged derived values and watch content must not be delivered').toEqual([]);
});
