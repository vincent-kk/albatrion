import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

const preventError = (event: ErrorEvent) => event.preventDefault();
beforeEach(() => {
  window.addEventListener('error', preventError);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.removeEventListener('error', preventError);
});

it.each([
  ['radio', 'constructor'],
  ['radio', 'toString'],
  ['radio', '__proto__'],
  ['radio', 'hasOwnProperty'],
  ['checkbox', 'constructor'],
  ['checkbox', 'toString'],
  ['checkbox', '__proto__'],
  ['checkbox', 'hasOwnProperty'],
  ['select', 'constructor'],
  ['select', 'toString'],
  ['select', '__proto__'],
  ['select', 'hasOwnProperty'],
])('%s treats %s like an ordinary enum name', (kind, token) => {
  const labels = (raw: string, explicit: boolean) => {
    const enumValues = [raw, 'owner'];
    const field = { type: 'string' as const, enum: enumValues };
    const alias = explicit
      ? { [raw]: 'Choice', owner: 'Owner' }
      : { owner: 'Owner' };
    const presentation = {
      inputType: kind === 'select' ? undefined : kind,
      FieldInputProps: { alias },
    };
    const view = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            choice:
              kind === 'checkbox'
                ? { type: 'array', items: field, presentation }
                : { ...field, presentation, default: raw },
          },
        }}
      />,
    );
    let text: (string | null)[];
    if (kind === 'select') {
      const trigger = document.querySelector(
        '.ant-select-selector,[role="combobox"]',
      );
      if (trigger) fireEvent.mouseDown(trigger);
      text = Array.from(
        document.querySelectorAll('.ant-select-item-option,[role="option"]'),
      ).map((e) => e.textContent);
    } else if (kind === 'switch') {
      text = [document.querySelector('[role="switch"]')?.textContent ?? null];
    } else {
      const selector =
        kind === 'radio' ? 'input[type="radio"]' : 'input[type="checkbox"]';
      text = Array.from(view.container.querySelectorAll(selector)).map(
        (e) =>
          e.closest('label')?.textContent ?? e.parentElement?.textContent ?? '',
      );
    }
    const result = text.map((label) => label?.split(raw).join('TOKEN'));
    cleanup();
    return result;
  };
  expect(labels(token, false)).toEqual(labels('plain', false));
  expect(labels(token, true)).toEqual(labels('plain', true));
});
