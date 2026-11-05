import { type FC, createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  isVirtualNode,
} from '@/schema-form';

/** Date range input over the virtual tuple value.
 * @param props - FieldInput props whose value is `[start, end]`.
 * @returns The tuple text and a button that writes a fixed range. */
const DateRangeInput: FC<FieldInputProps<[string, string]>> = ({
  value,
  onChange,
}) => (
  <div data-testid="date-range">
    <span data-testid="range-value">{JSON.stringify(value)}</span>
    <button onClick={() => onChange(['2025-01-01', '2025-01-31'])}>Pick</button>
  </div>
);

// prettier-ignore
const virtualSchema: JSONSchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  options: {                       // sibling of `properties`, NOT inside it
    virtual: {
      period: {
        fields: ['startDate', 'endDate'],
        presentation: { FieldInput: DateRangeInput },  // optional
        controls: { /* … */ },          // optional
      },
    },
  },
}

afterEach(cleanup);

it('options.virtual beside properties defines a group whose presentation input owns the tuple', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={virtualSchema}
      defaultValue={{ startDate: '2024-12-01', endDate: '2024-12-31' }}
    />,
  );
  expect((await screen.findByTestId('range-value')).textContent).toBe(
    '["2024-12-01","2024-12-31"]',
  );
  expect(isVirtualNode(ref.current!.findNode('/period')!)).toBe(true);
  expect(ref.current!.findNode('/startDate')).not.toBeNull();

  fireEvent.click(screen.getByText('Pick'));
  expect(ref.current!.getValue()).toEqual({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  });
});

it('a group declared inside properties becomes a plain property, not a top-level virtual field', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          options: {
            type: 'object',
            virtual: {
              period: {
                fields: ['startDate', 'endDate'],
                presentation: { FieldInput: DateRangeInput },
              },
            },
          },
        } as JSONSchema['properties'],
      }}
    />,
  );
  await act(async () => {});
  expect(ref.current!.findNode('/options')).not.toBeNull();
  expect(ref.current!.findNode('/period')).toBeNull();
  expect(screen.queryByTestId('date-range')).toBeNull();
});

it('controls on a virtual group steer its visibility like any other field', async () => {
  const ref = createRef<FormHandle>();
  const controlled: JSONSchema = {
    type: 'object',
    properties: {
      toggle: { type: 'boolean' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
    },
    options: {
      virtual: {
        period: {
          fields: ['startDate', 'endDate'],
          presentation: { FieldInput: DateRangeInput },
          controls: { visible: '../toggle === true' },
        },
      },
    },
  };
  render(
    <Form ref={ref} jsonSchema={controlled} defaultValue={{ toggle: false }} />,
  );
  await act(async () => {});
  expect(screen.queryByTestId('date-range')).toBeNull();
  act(() => {
    ref.current!.setValue({ toggle: true });
  });
  expect(await screen.findByTestId('date-range')).toBeTruthy();
});
