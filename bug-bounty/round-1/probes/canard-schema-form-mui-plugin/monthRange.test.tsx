import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../../fieldInputs/FieldInputDate';
import { FieldInputMonthDefinition } from '../../fieldInputs/FieldInputMonth';

type PickerProps = { minDate?: unknown; maxDate?: unknown };

const received = vi.hoisted(() => ({ props: [] as PickerProps[] }));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: PickerProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});
afterEach(cleanup);

it('date picker receives minimum and maximum (control case)', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputDateDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'date',
        minimum: '2024-03-01',
        maximum: '2024-06-30',
      } as never}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect(Object.keys(props)).toContain('minDate');
  expect(props.minDate).toBeDefined();
  expect(props.maxDate).toBeDefined();
});

it('date picker sees the schema minimum it was given', () => {
  const seen: unknown[] = [];
  const Date = FieldInputDateDefinition.Component as (p: never) => never;
  render(
    <Form
      fieldInputDefinitions={[
        {
          test: FieldInputDateDefinition.test,
          Component: (p: { jsonSchema: unknown }) => {
            seen.push(p.jsonSchema);
            return <Date {...(p as never)} />;
          },
        },
      ]}
      jsonSchema={{
        type: 'string',
        format: 'date',
        minimum: '2024-03-01',
      } as never}
      onError={() => {}}
    />,
  );
  expect(seen.at(-1)).toMatchObject({ minimum: '2024-03-01' });
});

it('date picker receives limits given through presentation.FieldInputProps', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputDateDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'date',
        presentation: {
          FieldInputProps: { minimum: '2024-03-01', maximum: '2024-06-30' },
        },
      }}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.minDate).toBeDefined();
  expect(props.maxDate).toBeDefined();
});

it('month picker receives minimum and maximum as the README states', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputMonthDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'month',
        minimum: '2024-03',
        maximum: '2024-06',
      } as never}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.minDate).toBeDefined();
  expect(props.maxDate).toBeDefined();
});
