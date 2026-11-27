import type { ReactElement } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';

import { type FieldRendererProps, Form } from '@canard/schema-form';

import { plugin } from '../index';

/** The lock props each render of the template renderer received. */
const received: Pick<FieldRendererProps, 'readOnly' | 'disabled'>[] = [];

beforeEach(() => {
  received.length = 0;
});

afterEach(cleanup);

/**
 * The FieldRenderer template of the ui-plugin-guidelines skill: it renders a bare `<Input />`.
 * @param props - Bound parts and the layout's presentation locks, which it only records.
 * @returns The label, the input and the error root, in that order.
 */
const TemplateFieldRenderer = ({
  readOnly,
  disabled,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps): ReactElement => {
  received.push({ readOnly, disabled });
  return (
    <>
      <Label />
      <Input />
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </>
  );
};

it.each([
  ['readOnly', true],
  ['readOnly', false],
  ['disabled', true],
  ['disabled', false],
] as const)(
  'a Form.Field %s of %s reaches the MUI input through a renderer that renders a bare Input',
  (lock, value) => {
    const { container } = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: { name: { type: 'string' } },
        }}
        defaultValue={{ name: 'Ada' }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      >
        <Form.Field
          path="/name"
          {...{ [lock]: value }}
          FieldRenderer={TemplateFieldRenderer}
        />
      </Form>,
    );
    expect(received.at(-1)?.[lock]).toBe(value);
    expect(
      container.querySelector<HTMLInputElement>('input[name="name"]')?.[lock],
    ).toBe(value);
  },
);
