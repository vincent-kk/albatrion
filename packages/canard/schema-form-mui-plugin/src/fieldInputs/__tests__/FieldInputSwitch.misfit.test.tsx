import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';

afterEach(cleanup);

const renderBooleanSwitch = (defaultValue: unknown) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputBooleanSwitchDefinition]}
      jsonSchema={{ type: 'boolean', presentation: { inputType: 'switch' } }}
      defaultValue={defaultValue as never}
      onError={() => {}}
    />,
  );
  return ref;
};

it('draws an object on a boolean switch as off with the invalid marker, and one click writes true', () => {
  const ref = renderBooleanSwitch({ a: 1 });
  const control = screen.getByRole('checkbox') as HTMLInputElement;
  expect(control.checked).toBe(false);
  expect(control.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Invalid value');
  fireEvent.click(control);
  expect(ref.current!.getValue()).toBe(true);
  expect(screen.getByRole('checkbox').hasAttribute('aria-invalid')).toBe(false);
  expect(screen.queryByRole('status')).toBeNull();
});

it('follows a value written from outside', () => {
  const ref = renderBooleanSwitch(false);
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  act(() => ref.current!.setValue(true));
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  act(() => ref.current!.setValue(false));
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
});

it('gives no marker to a string outside the enum on a string switch, and follows outside writes', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringSwitchDefinition]}
      jsonSchema={{
        type: 'string',
        enum: ['off', 'on'],
        presentation: { inputType: 'switch' },
      }}
      defaultValue="other"
      onError={() => {}}
    />,
  );
  const control = () => screen.getByRole('checkbox') as HTMLInputElement;
  expect(control().checked).toBe(false);
  expect(control().hasAttribute('aria-invalid')).toBe(false);
  expect(screen.queryByRole('status')).toBeNull();
  act(() => ref.current!.setValue('on'));
  expect(control().checked).toBe(true);
  fireEvent.click(control());
  expect(ref.current!.getValue()).toBe('off');
});
