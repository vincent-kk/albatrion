import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('passes the bound input address, presentation and renderer locks to the text control', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      jsonSchema={{
        type: 'object',
        properties: {
          Caption: {
            type: 'string',
            presentation: {
              FieldRendererProps: {
                className: 'contract-frame',
                style: { paddingTop: 3 },
                readOnly: true,
              },
              FieldInputProps: {
                className: 'contract-input',
                style: { marginTop: 7 },
                placeholder: 'Bound text',
              },
            },
          },
          Locked: {
            type: 'string',
            presentation: { FieldRendererProps: { disabled: true } },
          },
        },
      }}
      defaultValue={{ Caption: 'Current', Locked: 'Locked' }}
      validationMode={0}
    />,
  );

  const input = screen.getByPlaceholderText<HTMLInputElement>('Bound text');
  const frame = container.querySelector<HTMLElement>('.contract-frame');
  const control = input.closest<HTMLElement>('.contract-input');
  expect(input.id).toBeTruthy();
  expect(container.querySelector(`label[for="${input.id}"]`)).toBeTruthy();
  expect(input.name).toBe('Caption');
  expect(input.value).toBe('Current');
  expect(input.readOnly).toBe(true);
  expect(screen.getByDisplayValue<HTMLInputElement>('Locked').disabled).toBe(
    true,
  );
  expect(frame?.contains(input)).toBe(true);
  expect(frame?.style.paddingTop).toBe('3px');
  expect(control?.style.marginTop).toBe('7px');
});

it('reports an invalid array shape on the bound widget group', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: { Items: { type: 'array', items: { type: 'string' } } },
      }}
      defaultValue={{ Items: ['kept'] }}
      validationMode={0}
    />,
  );
  const group = () =>
    container.querySelector('[data-path="/Items"] [role="group"][id]');
  expect(group()?.hasAttribute('aria-invalid')).toBe(false);
  act(() => ref.current!.setValue({ Items: 'not an array' }));
  expect(ref.current!.getValue()).toEqual({ Items: 'not an array' });
  expect(group()?.getAttribute('aria-invalid')).toBe('true');
  act(() => ref.current!.setValue({ Items: ['restored'] }));
  expect(group()?.hasAttribute('aria-invalid')).toBe(false);
});
