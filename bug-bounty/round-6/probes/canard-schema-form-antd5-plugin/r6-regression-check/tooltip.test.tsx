import { writeFileSync } from 'node:fs';
import { afterAll } from 'vitest';
// Loaded by Vitest; each revision imports an unchanged archived plugin entry.
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { plugin as parent } from './cafc784f1-parent/src/index';
import { plugin as commit } from './cafc784f1/src/index';
beforeEach(() => vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it.each([
  ['cafc784f1-parent', parent, '0.000001'],
  ['cafc784f1', commit, '10'],
] as const)('%s endpoint tooltip', async (revision, plugin, expected) => {
  const view = render(<Form jsonSchema={{ type: 'number', format: 'slider', minimum: 0, maximum: 1e-6, multipleOf: 1e-7, presentation: { inputType: 'slider' } }} defaultValue={0.000001} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  fireEvent.mouseEnter(view.getByRole('slider'));
  await waitFor(() => expect(view.getByRole('tooltip')).toBeTruthy());
  const tooltip = view.getByRole('tooltip').textContent;
  const ariaValue = view.getByRole('slider').getAttribute('aria-valuenow');
  observations.push({ revision, tooltip, ariaValue });
  expect(tooltip).toBe(expected);
});

const observations: unknown[] = [];
afterAll(() => writeFileSync('src/__bounty__/r6-regression-check/tooltip.test.observations.json', JSON.stringify(observations, null, 2) + '\n'));
