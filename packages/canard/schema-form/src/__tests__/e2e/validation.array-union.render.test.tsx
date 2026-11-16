import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isValidationError,
  useFieldErrors,
} from '@/schema-form';

import { createRenderValidator } from '../helpers/createRenderValidator';

afterEach(cleanup);

/**
 * Display the public error hook's field feedback.
 * @param props - Field binding supplied by Form.
 * @returns Schema locations for the errors visible on this field.
 */
const ValueErrors = ({ node }: FieldInputProps) => {
  const { errors } = useFieldErrors(node);
  return (
    <output data-testid={node.path}>
      {errors.map((error) => error.schemaPath).join('|')}
    </output>
  );
};

it('shows only each array item branch while retaining validation failure on submit', async () => {
  const schema: JSONSchema = {
    type: 'array',
    items: {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: {
        kind: { type: 'string' },
        value: { type: 'string', presentation: { FieldInput: ValueErrors } },
      },
      oneOf: [
        { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
        { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
      ],
    },
  };
  const ref = createRef<FormHandle>();
  const onSubmit = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={[
        { kind: 'x', value: 'a' },
        { kind: 'y', value: 'a' },
      ]}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.Always}
      validatorFactory={createRenderValidator()}
      onSubmit={onSubmit}
    />,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  expect(screen.getByTestId('/0/value').textContent).toBe(
    '#/items/oneOf/0/properties/value/minLength',
  );
  expect(screen.getByTestId('/1/value').textContent).toBe(
    '#/items/oneOf/1/properties/value/minLength',
  );
  expect(
    ref.current!.getErrors().filter((error) => error.dataPath === '/0/value'),
  ).toHaveLength(2);
  let rejection: unknown;
  await act(async () => {
    await ref.current!.submit().catch((error: unknown) => {
      rejection = error;
    });
  });
  expect(isValidationError(rejection)).toBe(true);
  expect(onSubmit).not.toHaveBeenCalled();
});
