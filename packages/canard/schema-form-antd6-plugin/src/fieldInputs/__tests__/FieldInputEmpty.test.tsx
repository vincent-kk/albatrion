import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputUriDefinition } from '../FieldInputUri';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => vi.unstubAllGlobals());

describe.each([
  ['String', FieldInputStringDefinition, undefined, 'hello', 'hello'],
  ['Textarea', FieldInputTextareaDefinition, 'textarea', 'hello', 'hello'],
  ['Uri', FieldInputUriDefinition, 'uri', 'example.com', 'http://example.com'],
] as const)('%s empty input', (_, definition, format, text, value) => {
  it.each([false, true])(
    'publishes undefined after typing and clearing (nullable: %s)',
    async (nullable) => {
      const ref = createRef<FormHandle>();
      render(
        <Form
          ref={ref}
          fieldInputDefinitions={[definition]}
          jsonSchema={{
            type: 'object',
            properties: {
              value: {
                type: nullable ? ['string', 'null'] : 'string',
                format,
                options: { omitEmpty: false },
              },
            },
          }}
        />,
      );
      const input = screen.getByRole('textbox');
      await userEvent.type(input, text);
      expect(ref.current!.getValue()).toEqual({ value });
      await userEvent.clear(input);
      expect(ref.current!.getValue().value).toBeUndefined();
    },
  );
});

it.each([false, true])(
  'keeps an empty URI undefined when only the protocol changes (nullable: %s)',
  async (nullable) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputUriDefinition]}
        jsonSchema={{
          type: 'object',
          properties: {
            value: {
              type: nullable ? ['string', 'null'] : 'string',
              format: 'uri',
              options: { omitEmpty: false },
            },
          },
        }}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('ftp://'));
    expect(ref.current!.getValue().value).toBeUndefined();
    await userEvent.type(screen.getByRole('textbox'), 'example.com');
    expect(ref.current!.getValue()).toEqual({ value: 'ftp://example.com' });
  },
);
