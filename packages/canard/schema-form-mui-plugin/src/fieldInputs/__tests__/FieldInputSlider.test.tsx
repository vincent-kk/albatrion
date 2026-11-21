import { createRef } from 'react';

import type { SliderProps } from '@mui/material';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

/** Slider props captured by Vitest's hoisted MUI mock for callback assertions. */
const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/material')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

it.each([undefined, true, false])(
  'chooses a single native event for lazy %s',
  async (lazy) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'number',
          multipleOf: 3,
          default: 0,
          presentation: { inputType: 'slider', FieldInputProps: { lazy } },
        }}
      />,
    );
    const props = received.props.at(-1)!;
    expect(props.shiftStep).toBe(30);
    if (lazy === false) {
      expect(props.onChangeCommitted).toBeUndefined();
      await act(async () => props.onChange?.(new Event('change'), 42, 0));
    } else {
      expect(props.onChange).toBeUndefined();
      await act(async () =>
        props.onChangeCommitted?.(new Event('mouseup'), 42),
      );
    }
    expect(ref.current?.getValue()).toBe(42);
  },
);
