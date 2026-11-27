import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('stores an array when an option is chosen on a nullable array field holding null', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: ['array', 'null'],
        items: { type: 'string', enum: ['news', 'sports'] },
      }}
      defaultValue={null}
    />,
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  act(() => fireEvent.click(screen.getByTitle('news')));
  const value = ref.current!.getValue();
  expect(Array.isArray(value)).toBe(true);
  expect(value).toEqual(['news']);
});
