import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Slider } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it.each([5e-7, 1e-6])(
  'the tooltip displays schema value %s rather than its integer coordinate',
  async (value) => {
    const view = render(
      <Form
        jsonSchema={{
          type: 'number',
          format: 'slider',
          minimum: 0,
          maximum: 1e-6,
          multipleOf: 1e-7,
          presentation: { inputType: 'slider' },
        }}
        defaultValue={value}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
      />,
    );
    fireEvent.mouseEnter(view.getByRole('slider'));
    await waitFor(() => expect(view.getByRole('tooltip')).toBeTruthy());
    expect(view.getByRole('slider').getAttribute('aria-valuenow')).toBe(
      String(value),
    );
    expect(view.getByRole('tooltip').textContent).toBe(String(value));
  },
);
it('control: the pre-conversion library props show the endpoint in schema units', async () => {
  const view = render(
    <Slider min={0} max={1e-6} step={1e-7} defaultValue={1e-6} />,
  );
  fireEvent.mouseEnter(view.getByRole('slider'));
  await waitFor(() => expect(view.getByRole('tooltip')).toBeTruthy());
  expect(view.getByRole('tooltip').textContent).toBe('0.000001');
});
