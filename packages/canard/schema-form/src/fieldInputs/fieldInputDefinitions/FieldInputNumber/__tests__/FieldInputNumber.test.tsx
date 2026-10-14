import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it('shows a non-finite derived number as empty without changing its node value', () => {
  const ref = createRef<FormHandle>();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            source: { type: 'number' },
            twice: { type: 'number', controls: { derived: '../source * 2' } },
          },
        }}
        defaultValue={{ source: 2 }}
      />,
    );
    const source = view.container.querySelector<HTMLInputElement>(
      'input[id="/source"]',
    )!;
    fireEvent.change(source, { target: { value: '' } });
    expect(Number.isNaN(ref.current!.getValue().twice)).toBe(true);
    expect(
      view.container.querySelector<HTMLInputElement>('input[id="/twice"]')!
        .value,
    ).toBe('');
    expect(
      consoleError.mock.calls.some((args) =>
        args.some((arg) => String(arg).includes('Received NaN')),
      ),
    ).toBe(false);

    fireEvent.change(source, { target: { value: '3' } });
    expect(ref.current!.getValue().twice).toBe(6);
  } finally {
    consoleError.mockRestore();
  }
});
