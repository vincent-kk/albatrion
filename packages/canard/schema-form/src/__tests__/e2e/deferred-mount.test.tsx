import { act } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { VirtualizationBackfill, type JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
const idle: IdleRequestCallback[] = [];

/** A deterministic host observer exposes intersection without layout heuristics. */
class Observer {
  static instances: Observer[] = [];
  observed = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback) { Observer.instances.push(this); }
  observe(element: Element) { this.observed.add(element); }
  unobserve(element: Element) { this.observed.delete(element); }
  disconnect() { this.observed.clear(); }
  reveal(element: Element) { this.callback([{ target: element, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
}

beforeEach(() => {
  Observer.instances = [];
  idle.length = 0;
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => { idle.push(callback); return idle.length; });
  vi.stubGlobal('cancelIdleCallback', () => {});
});
afterEach(() => { form?.unmount(); vi.unstubAllGlobals(); });

const schema: JSONSchema = { type: 'object', properties: Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`f${index}`, { type: 'string', default: `v${index}` }])) };
const virtualization = { threshold: 2, eagerCount: 1, backfill: VirtualizationBackfill.None };

it('TEST-020 getValue includes deferred field values without mount onChange', async () => {
  form = await renderForm(schema, { virtualization });
  expect(form.deferred('/f7')).toBe(true);
  expect(form.getValue()).toEqual(Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`f${index}`, `v${index}`])));
  expect(form.changeLog()).toEqual([]);
});

it('LANDING-007 deferred fields follow controls visibility', async () => {
  form = await renderForm({ type: 'object', properties: { show: { type: 'boolean' }, ...schema.properties, extra: { type: 'string', default: 'extra', controls: { visible: '../show' } } } }, { defaultValue: { show: false }, virtualization });
  expect(form.exists('/extra')).toBe(false);
  await form.toggle('/show');
  await act(async () => form.handle.focus('/extra'));
  await form.flush();
  expect(form.exists('/extra')).toBe(true);
  expect(form.value('/extra')).toBe('extra');
});

it('LANDING-006 deferred branch placeholders follow controls active', async () => {
  form = await renderForm({ type: 'object', properties: { enabled: { type: 'boolean' }, ...schema.properties, extra: { type: 'string', controls: { active: '../enabled' } } } }, { defaultValue: { enabled: false }, virtualization });
  expect(form.wrapper('/extra')).toBeNull();
  await form.toggle('/enabled');
  expect(form.deferred('/extra')).toBe(true);
  await form.toggle('/enabled');
  expect(form.wrapper('/extra')).toBeNull();
});

it('LANDING-087 revealed fields stay eager after sibling removal', async () => {
  form = await renderForm({ type: 'array', items: { type: 'string' } }, { defaultValue: ['a', 'b', 'c', 'd'], virtualization });
  await act(async () => form.handle.focus('/3'));
  await form.flush();
  const revealed = form.node('/3');
  expect(form.exists('/3')).toBe(true);
  await act(async () => { const node = form.handle.node!; if (node.type !== 'array') throw new Error('Expected array'); node.remove(0); });
  expect(form.node('/2')).toBe(revealed);
  expect(form.exists('/2')).toBe(true);
  expect(form.deferred('/2')).toBe(false);
  expect(form.value('/2')).toBe('d');
});

it('TEST-021 intersection reveals the settled field under StrictMode', async () => {
  form = await renderForm(schema, { virtualization, strictMode: true });
  const placeholder = form.wrapper('/f7')!;
  const observer = Observer.instances.find((candidate) => candidate.observed.has(placeholder));
  expect(observer).toBeDefined();
  await act(async () => observer!.reveal(placeholder));
  expect(form.deferred('/f7')).toBe(false);
  expect(form.value('/f7')).toBe('v7');
  expect(form.caughtErrors()).toEqual([]);
});

it('TEST-021 StrictMode idle backfill completes without duplicate mount changes', async () => {
  form = await renderForm(schema, { virtualization: { ...virtualization, backfill: VirtualizationBackfill.Idle }, strictMode: true });
  for (let attempts = 0; attempts < 20 && idle.length; attempts++) {
    await act(async () => { const callbacks = idle.splice(0); callbacks.forEach((callback) => callback({ didTimeout: false, timeRemaining: () => 50 })); });
  }
  expect(form.deferredPaths()).toEqual([]);
  expect(form.value('/f7')).toBe('v7');
  expect(form.changeLog()).toEqual([]);
});

it('TEST-021 deferred focus replays once under StrictMode', async () => {
  form = await renderForm(schema, { virtualization, strictMode: true });
  const focuses: string[] = [];
  form.container.addEventListener('focusin', (event) => focuses.push((event.target as HTMLElement).id));
  await act(async () => form.handle.focus('/f7'));
  await form.flush();
  expect(document.activeElement).toBe(form.field('/f7'));
  expect(focuses.filter((path) => path === '/f7')).toEqual(['/f7']);
});

it('TEST-020 validation includes a deferred field before reveal', async () => {
  form = await renderForm({ ...schema, required: ['f7'], properties: { ...schema.properties, f7: { type: 'string', minLength: 3 } } } as JSONSchema, { virtualization, validator: true });
  expect(form.deferred('/f7')).toBe(true);
  expect(await form.validate()).toEqual(expect.arrayContaining([expect.objectContaining({ dataPath: '/f7', keyword: 'required' })]));
  await act(async () => form.handle.focus('/f7'));
  await form.flush();
  expect(form.exists('/f7')).toBe(true);
  expect(form.node('/f7')?.errors.length).toBeGreaterThan(0);
});
