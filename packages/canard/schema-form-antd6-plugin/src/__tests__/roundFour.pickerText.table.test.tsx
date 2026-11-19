import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', TestResizeObserver);
afterEach(cleanup);

it.each([
  { kind: 'date', initial: '2024-01-10', range: false, action: 'type' },
  { kind: 'date', initial: '2024-01-10', range: false, action: 'blur' },
  { kind: 'date', initial: '2024-01-10', range: true, action: 'type' },
  { kind: 'date', initial: '2024-01-10', range: true, action: 'blur' },
  { kind: 'month', initial: '2024-01', range: false, action: 'type' },
  { kind: 'month', initial: '2024-01', range: false, action: 'blur' },
  { kind: 'month', initial: '2024-01', range: true, action: 'type' },
  { kind: 'month', initial: '2024-01', range: true, action: 'blur' },
  { kind: 'time', initial: '09:00:00Z', range: false, action: 'type' },
  { kind: 'time', initial: '09:00:00Z', range: false, action: 'blur' },
  { kind: 'time', initial: '09:00:00Z', range: true, action: 'type' },
  { kind: 'time', initial: '09:00:00Z', range: true, action: 'blur' },
])(
  'keeps uncommitted text out of $kind range=$range during $action',
  async ({ kind, initial, range, action }) => {
    const ref = createRef<FormHandle>();
    const schema: JSONSchema = range
      ? { type: 'array', format: `${kind}-range`, items: { type: 'string' } }
      : { type: 'string', format: kind };
    const value = range ? [initial, initial] : initial;
    const { container } = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={value}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const input = container.querySelector('input');
    if (!input) throw new Error('Selected picker has no text input');
    await act(async () => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'uncommitted text' } });
      if (action === 'blur') fireEvent.blur(input);
    });
    expect(ref.current?.getValue()).toEqual(value);
  },
);
