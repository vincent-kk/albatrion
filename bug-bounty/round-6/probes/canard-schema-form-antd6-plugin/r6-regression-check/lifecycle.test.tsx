import { writeFileSync } from 'node:fs';
import { afterAll } from 'vitest';
// Loaded by Vitest; each revision imports an unchanged archived plugin entry.
import { createRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';
import { plugin as parent } from './16f3ba679-parent/src/index';
import { plugin as commit } from './16f3ba679/src/index';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, x: 0, y: 0, toJSON: () => ({}) });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const schema: JSONSchema = { type: 'object', properties: { level: { type: 'number', format: 'slider', minimum: 0, maximum: 10, presentation: { inputType: 'slider' } } } };
it.each([
  ['16f3ba679-parent', parent, '2.4'],
  ['16f3ba679', commit, '2'],
] as const)('%s read-only transition and direct mount', (revision, plugin, expected) => {
  const ref = createRef<FormHandle>();
  const form = (lock: boolean) => <Form ref={ref} readOnly={lock} defaultValue={{ level: 2.4 }} jsonSchema={schema} fieldInputDefinitions={plugin.fieldInputDefinitions} FieldRenderer={plugin.FieldRenderer} LabelRenderer={plugin.LabelRenderer} />;
  const view = render(form(false));
  view.rerender(form(true));
  const transitioned = view.getByRole('slider').getAttribute('aria-valuenow');
  const stored = ref.current!.getValue();
  view.unmount();
  const direct = render(form(true));
  const mounted = direct.getByRole('slider').getAttribute('aria-valuenow');
  observations.push({ revision, transitioned, mounted, stored });
  expect(stored).toEqual({ level: 2.4 });
  expect(transitioned).toBe(expected);
  expect(mounted).toBe('2.4');
});

const observations: unknown[] = [];
afterAll(() => writeFileSync('src/__bounty__/r6-regression-check/lifecycle.test.observations.json', JSON.stringify(observations, null, 2) + '\n'));
