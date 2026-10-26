import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';

afterEach(cleanup);

it('draws an object on a boolean switch as off with the invalid marker, and one click writes true', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputBooleanSwitchDefinition]}
      jsonSchema={{
        type: 'boolean',
        presentation: { inputType: 'switch' },
      }}
      defaultValue={{ a: 1 } as never}
      onError={() => {}}
    />,
  );
  const control = screen.getByRole('switch');
  expect(control.getAttribute('aria-checked')).toBe('false');
  expect(control.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Invalid value');
  fireEvent.click(control);
  expect(ref.current!.getValue()).toBe(true);
  expect(screen.getByRole('switch').hasAttribute('aria-invalid')).toBe(false);
  expect(screen.queryByRole('status')).toBeNull();
});

it('gives no marker to a string outside the enum on a string switch', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputStringSwitchDefinition]}
      jsonSchema={{
        type: 'string',
        enum: ['on', 'off'],
        presentation: { inputType: 'switch' },
      }}
      defaultValue="other"
      onError={() => {}}
    />,
  );
  const control = screen.getByRole('switch');
  expect(control.getAttribute('aria-checked')).toBe('false');
  expect(control.hasAttribute('aria-invalid')).toBe(false);
  expect(screen.queryByRole('status')).toBeNull();
});
