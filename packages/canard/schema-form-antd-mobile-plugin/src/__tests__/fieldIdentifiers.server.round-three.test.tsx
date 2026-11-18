import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const props = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
};

it('pins mobile server identifiers and the supported hydration boundary (round-3 id review 5)', () => {
  const form = (
    <Form
      {...props}
      jsonSchema={{
        type: 'object',
        properties: {
          Stepper: { type: 'number' },
          Switch: { type: 'boolean', presentation: { inputType: 'switch' } },
          Radio: {
            type: 'string',
            enum: ['one', 'two'],
            presentation: { inputType: 'radio' },
          },
          Slider: { type: 'number', format: 'slider' },
        },
      }}
      defaultValue={{ Stepper: 2, Switch: true, Radio: 'one', Slider: 3 }}
    />
  );
  const server = document.createElement('div');
  server.innerHTML = renderToString(form);
  expect(
    server.querySelector<HTMLInputElement>('[data-path="/Stepper"] input')!.id,
  ).toBe('');
  expect(server.querySelector<HTMLElement>('[role="switch"]')!.id).toBe('');
  const radios = server.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  expect(radios).toHaveLength(2);
  for (const radio of radios) {
    expect(radio.id).toContain(':/Radio-');
    expect(radio.name).toBe('');
  }
  const slider = server.querySelector<HTMLElement>('[role="slider"]')!;
  expect(slider.id).toBe('');
  expect(slider.hasAttribute('aria-labelledby')).toBe(false);
  const toggle = server.querySelector<HTMLElement>('[role="switch"]')!;
  expect(toggle.getAttribute('aria-labelledby')).toBe(
    server.querySelector('[data-path="/Switch"] label')!.id,
  );
  const view = render(form);
  expect(
    view.container.querySelector('[data-path="/Stepper"] input')!.id,
  ).toContain(':/Stepper');
  expect(view.container.querySelector('[role="switch"]')!.id).toContain(
    ':/Switch',
  );
  for (const radio of view.container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  ))
    expect(radio.name).toContain(':/Radio');
  const mounted = view.container.querySelector<HTMLElement>('[role="slider"]')!;
  expect(mounted.id).toContain(':/Slider');
  expect(mounted.getAttribute('aria-labelledby')).toBeTruthy();
});
