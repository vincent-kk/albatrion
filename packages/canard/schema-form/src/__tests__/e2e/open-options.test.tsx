import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, Form } from '../../index';

/** Consumer input reads its own options through the public node schema. */
const CustomInput = ({ node }: FieldInputProps) => (
  <output>
    {String(
      typeof node.jsonSchema === 'object'
        ? node.jsonSchema.options?.customLabel
        : undefined,
    )}
  </output>
);

afterEach(cleanup);

it('passes an unknown option to a FieldInput without an error or warning', () => {
  const onError = vi.fn();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    render(
      <Form
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
