import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows no selected enum option or current label for an undefined value', () => {
  const view = render(
    <Form
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
    />,
  );
  const combobox = screen.getByRole<HTMLInputElement>('combobox');
  expect(combobox.value).toBe('');
  expect(view.container.textContent?.trim()).toBe('');
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});

it('clears the current enum label when a form value returns to undefined', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
      defaultValue="US"
    />,
  );
  expect(view.container.textContent?.trim()).toBe('US');
  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current!.getValue()).toBeUndefined();
  expect(view.container.textContent?.trim()).toBe('');
  const combobox = screen.getByRole<HTMLInputElement>('combobox');
  expect(combobox.value).toBe('');
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});
