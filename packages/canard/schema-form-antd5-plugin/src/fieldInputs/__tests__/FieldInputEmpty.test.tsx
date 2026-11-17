import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputUriDefinition } from '../FieldInputUri';

afterEach(cleanup);

it.each([
  ['String non-nullable', FieldInputStringDefinition, undefined, false],
  ['String nullable', FieldInputStringDefinition, undefined, true],
  ['Textarea non-nullable', FieldInputTextareaDefinition, 'textarea', false],
  ['Textarea nullable', FieldInputTextareaDefinition, 'textarea', true],
  ['Uri non-nullable', FieldInputUriDefinition, 'uri', false],
  ['Uri nullable', FieldInputUriDefinition, 'uri', true],
] as const)(
  '%s publishes undefined after typing and clearing',
  async (_, definition, format, nullable) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{
          type: 'object',
          options: { omitEmpty: false },
          properties: {
            text: {
              type: nullable ? ['string', 'null'] : 'string',
              format,
              options: { omitEmpty: false },
            },
          },
        }}
        onError={() => {}}
      />,
    );
    const input = container.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >('[id="/text"]')!;
    await userEvent.type(input, 'example.com');
    expect(ref.current!.getValue()).toEqual({
      text: format === 'uri' ? 'http://example.com' : 'example.com',
    });
    await userEvent.clear(input);
    expect(ref.current!.getValue()).toEqual({ text: undefined });
    expect(input.value).toBe('');
  },
);

it.each([false, true])(
  'keeps a protocol-only change local until an address is typed (nullable: %s)',
  async (nullable) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputUriDefinition]}
        jsonSchema={{
          type: 'object',
          options: { omitEmpty: false },
          properties: {
            text: {
              type: nullable ? ['string', 'null'] : 'string',
              format: 'uri',
              options: { omitEmpty: false },
            },
          },
        }}
        onError={() => {}}
      />,
    );
    await userEvent.click(container.querySelector('.ant-select-selector')!);
    await userEvent.click(screen.getByTitle('ftp://'));
    expect(ref.current!.getValue()).toEqual({ text: undefined });
    expect(
      container.querySelector('.ant-select-selection-item')!.textContent,
    ).toBe('ftp://');
    const input = container.querySelector<HTMLInputElement>('[id="/text"]')!;
    await userEvent.type(input, 'example.com');
    expect(ref.current!.getValue()).toEqual({ text: 'ftp://example.com' });
    await userEvent.clear(input);
    expect(ref.current!.getValue()).toEqual({ text: undefined });
  },
);
