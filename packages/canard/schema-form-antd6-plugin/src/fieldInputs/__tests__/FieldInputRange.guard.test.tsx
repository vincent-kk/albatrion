import { cleanup, render } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

it.each([
  ['date-range', FieldInputDateRangeDefinition],
  ['month-range', FieldInputMonthRangeDefinition],
  ['time-range', FieldInputTimeRangeDefinition],
])(
  '%s renders a length-2 string as an empty range with the misfit marker',
  (format, definition) => {
    const { container } = render(
      <Form
        fieldInputDefinitions={[definition]}
        jsonSchema={{
          type: 'array',
          format,
          items: { type: 'string' },
        }}
        defaultValue={'ab' as never}
        onError={() => {}}
      />,
    );
    const inputs = Array.from(container.querySelectorAll('input'));
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    for (const input of inputs) expect(input.value).toBe('');
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    expect(container.querySelector('.ant-picker-status-error')).not.toBeNull();
  },
);
