import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  useFieldErrors,
} from '@/schema-form';

afterEach(cleanup);

const ValueErrors = ({ node }: FieldInputProps) => {
  const { errors } = useFieldErrors(node);
  return (
    <output data-testid={node.path}>
      {errors.map((error) => error.keyword).join('|')}
    </output>
  );
};

const build = (id?: string): JSONSchema => ({
  ...(id ? { $id: id } : {}),
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
      { properties: { kind: { const: 'y' }, value: { maxLength: 0 } } },
    ],
  },
});

it.each([
  ['without $id', undefined],
  ['with root $id', 'urn:sf-validation:union-root'],
])('hides the inactive branch error on an array item field (%s) with the shipped ajv8 plugin', async (_, id) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={build(id)}
      defaultValue={[{ kind: 'x', value: 'a' }]}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.Always}
      validatorFactory={plugin.validator}
    />,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  console.log(JSON.stringify(ref.current!.getErrors().map((e) => [e.dataPath, e.schemaPath])));
  // Active branch 0 rejects minLength; inactive branch 1 rejects maxLength and must stay hidden.
  expect(screen.getByTestId('/0/value').textContent).toBe('minLength');
});
