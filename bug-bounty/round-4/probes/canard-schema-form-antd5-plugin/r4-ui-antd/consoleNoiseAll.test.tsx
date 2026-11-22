import { StrictMode } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const schema: JSONSchema = {
  type: 'object',
  properties: {
    password: { type: 'string', format: 'password' },
    multiple: { type: 'array', items: { type: 'string', enum: ['one', 'two'] } },
    date: { type: 'string', format: 'date' },
    month: { type: 'string', format: 'month' },
    time: { type: 'string', format: 'time' },
    dateRange: { type: 'array', format: 'date-range', items: { type: 'string' } },
    monthRange: { type: 'array', format: 'month-range', items: { type: 'string' } },
    timeRange: { type: 'array', format: 'time-range', items: { type: 'string' } },
    list: { type: 'array', items: { type: 'string' } },
  },
};

const value = {
  password: 'secret',
  multiple: ['one'],
  date: '2024-01-10',
  month: '2024-01',
  time: '12:30:00Z',
  dateRange: ['2024-01-10', '2024-01-12'],
  monthRange: ['2024-01', '2024-03'],
  timeRange: ['09:00:00Z', '18:00:00Z'],
  list: ['a'],
};

it('pickers, multiple select, password and array mount and open without console warnings', async () => {
  const messages: string[] = [];
  const record = (...args: unknown[]) => {
    const text = args.map(String).join(' ');
    if (!/VALIDATOR_MISSING|Validation is disabled|not wrapped in act/.test(text))
      messages.push(text.slice(0, 200));
  };
  vi.spyOn(console, 'warn').mockImplementation(record);
  vi.spyOn(console, 'error').mockImplementation(record);
  const { container } = render(
    <StrictMode>
      <Form
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
        ErrorMessageRenderer={plugin.ErrorMessageRenderer}
        defaultValue={value}
        onError={() => {}}
      />
    </StrictMode>,
  );
  for (const input of container.querySelectorAll<HTMLInputElement>('.ant-picker input, .ant-select input')) {
    fireEvent.mouseDown(input);
    fireEvent.click(input);
    await act(async () => {});
  }
  expect(messages).toEqual([]);
});
