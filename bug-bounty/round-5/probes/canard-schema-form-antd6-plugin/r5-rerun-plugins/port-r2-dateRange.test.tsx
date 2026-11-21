// Port of round 2 antd6 `arrayValueInputs.test.tsx`, "date range (array of two dates) follows external
// writes" (round 2 item 1, high; cause in the core). The only change is a ResizeObserver stub: the
// antd 6 RangePicker now needs ResizeObserver at mount, which jsdom lacks, so without it the field
// renders the core's error fallback and no input.
import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= TestResizeObserver;

afterEach(cleanup);

describe('date range (array of two dates) follows external writes', () => {
  it('root setValue with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            span: {
              type: 'array',
              format: 'date-range',
              items: { type: 'string', format: 'date' },
            },
          },
        }}
        defaultValue={{ span: ['2024-01-10', '2024-01-12'] }}
      />,
    );
    const shown = () =>
      Array.from(container.querySelectorAll<HTMLInputElement>('input')).map(
        (input) => input.value,
      );
    expect(shown()).toEqual(['2024-01-10', '2024-01-12']);
    await act(async () =>
      ref.current!.setValue({ span: ['2024-03-01', '2024-03-05'] }),
    );
    expect(ref.current!.getValue()).toEqual({
      span: ['2024-03-01', '2024-03-05'],
    });
    expect(shown()).toEqual(['2024-03-01', '2024-03-05']);
  });

  it('node setValue with the same length and a reset', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            span: {
              type: 'array',
              format: 'date-range',
              items: { type: 'string', format: 'date' },
            },
          },
        }}
        defaultValue={{ span: ['2024-01-10', '2024-01-12'] }}
      />,
    );
    const shown = () =>
      Array.from(container.querySelectorAll<HTMLInputElement>('input')).map(
        (input) => input.value,
      );
    await act(async () =>
      ref.current!.findNode('/span')!.setValue(['2024-04-01', '2024-04-02']),
    );
    expect(shown()).toEqual(['2024-04-01', '2024-04-02']);
    await act(async () => ref.current!.reset());
    expect(ref.current!.getValue()).toEqual({
      span: ['2024-01-10', '2024-01-12'],
    });
    expect(shown()).toEqual(['2024-01-10', '2024-01-12']);
  });
});
