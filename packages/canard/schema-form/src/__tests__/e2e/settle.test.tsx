import { conditionalScreenScenarios, playScenario, settleScenarios } from '@aileron/schema-form-scenarios';
import { act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { SchemaNodeState, type JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

for (const scenario of settleScenarios) it(`TEST-023 ${scenario.name}`, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
  await playScenario(scenario, form.container);
  expect(form.caughtErrors()).toEqual([]);
});

for (const scenario of conditionalScreenScenarios) it(scenario.name, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
  await playScenario(scenario, form.container);
  expect(form.value('/job')).toBe(scenario.name.includes('rapid') ? '' : 'writer');
});

it('TEST-020 mount settlement exposes trimmed defaults without onChange', async () => {
  const onChange = vi.fn();
  const onDiagnosticsChange = vi.fn();
  form = await renderForm({ type: 'array', options: { omitTrailing: true }, items: { type: ['string', 'null'] } }, { defaultValue: [undefined, 'kept', undefined], onChange, onDiagnosticsChange, strictMode: true });
  expect(form.getValue()).toEqual([null, 'kept']);
  expect(form.exists('/2')).toBe(true);
  expect(onChange).not.toHaveBeenCalled();
  expect(onDiagnosticsChange).not.toHaveBeenCalled();
});

it('TEST-020 rendering and mounting settled defaults never calls onChange', async () => {
  const onChange = vi.fn();
  const observations: number[] = [];
  form = await renderForm({ type: 'string', default: 'settled' }, { strictMode: true, onChange, children: ({ value }) => { observations.push(onChange.mock.calls.length); return <output>{String(value)}</output>; } });
  expect(observations.length).toBeGreaterThan(0);
  expect(observations.every((count) => count === 0)).toBe(true);
  expect(form.container.querySelector('output')?.textContent).toBe('settled');
  expect(onChange).not.toHaveBeenCalled();
});

it('LANDING-157 reset clears interaction state and remounts terminal inputs', async () => {
  form = await renderForm({ type: 'object', properties: { name: { type: 'string' } } }, { defaultValue: { name: 'loaded' }, instrument: true });
  const root = form.handle.node;
  const node = form.node('/name');
  const ordinal = form.mountOrdinal('/name');
  await form.type('/name', 'changed');
  await form.user.tab();
  await form.flush();
  expect(node!.state[SchemaNodeState.Dirty]).toBe(true);
  await form.reset();
  expect(form.handle.node).toBe(root);
  expect(form.node('/name')).toBe(node);
  expect(node!.state).toEqual({});
  expect(form.mountOrdinal('/name')).toBeGreaterThan(ordinal);
  expect(form.value('/name')).toBe('loaded');
});

it('TEST-020 blur immediately followed by reset discards deferred touched', async () => {
  form = await renderForm({ type: 'string' }, { defaultValue: 'loaded' });
  const field = form.field('')!;
  await act(async () => { field.focus(); field.blur(); form.handle.reset(); });
  await act(async () => { await new Promise(requestAnimationFrame); });
  expect(form.handle.getState()[SchemaNodeState.Touched]).not.toBe(true);
});

it('TEST-020 blur immediately followed by clearState discards deferred touched', async () => {
  form = await renderForm({ type: 'string' }, { defaultValue: 'loaded' });
  const field = form.field('')!;
  await act(async () => { field.focus(); field.blur(); form.handle.clearState(); });
  await act(async () => { await new Promise(requestAnimationFrame); });
  expect(form.handle.getState()[SchemaNodeState.Touched]).not.toBe(true);
});
