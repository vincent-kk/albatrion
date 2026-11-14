import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
  ValidationMode,
} from '../../index';

/** Consumer input reads its own options through the public node schema. */
const CustomInput = ({ node }: FieldInputProps) => {
  const schema = node.jsonSchema as JSONSchema;
  return <output>{String(schema.options?.customLabel)}</output>;
};

afterEach(cleanup);

it('passes an unknown option to a FieldInput without an error or warning', () => {
  const onError = vi.fn();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    render(
      <Form
        validationMode={ValidationMode.None}
        jsonSchema={{
          type: 'string',
          options: { customLabel: 'consumer payload' },
          presentation: { FieldInput: CustomInput },
        }}
        onError={onError}
      />,
    );
    expect(screen.getByText('consumer payload')).toBeTruthy();
    expect(onError).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  } finally {
    warning.mockRestore();
  }
});
