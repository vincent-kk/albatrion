import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../../fieldInputs/FieldInputStringEnum';

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

it('readOnly enum select keeps the displayed selection equal to the stored value', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['alpha', 'beta'] }}
      defaultValue="alpha"
    />,
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const options = document.querySelectorAll('.ant-select-item-option');
  if (options[1]) fireEvent.click(options[1]);
  expect(ref.current!.getValue()).toBe('alpha');
  const root = container.querySelector('.ant-select')!;
  expect(root.textContent).toContain('alpha');
  expect(root.textContent).not.toContain('beta');
});
