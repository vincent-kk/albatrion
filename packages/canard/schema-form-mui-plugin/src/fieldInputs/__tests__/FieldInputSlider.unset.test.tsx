import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

afterEach(cleanup);

const renderSlider = (defaultValue?: number) => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 10,
        maximum: 20,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={defaultValue}
    />,
  );
  const thumb = () =>
    container.querySelector<HTMLInputElement>('input[type="range"]')!;
  return { ref, thumb };
};

it('slider with no value does not display a value the form does not hold', () => {
  const { ref, thumb } = renderSlider();
  expect(ref.current!.getValue()).toBeUndefined();
  expect(thumb().getAttribute('aria-valuenow')).toBeNull();
});

it('an external reset to undefined returns the slider to the unset state', async () => {
  const { ref, thumb } = renderSlider(15);
  expect(thumb().getAttribute('aria-valuenow')).toBe('15');
  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current!.getValue()).toBeUndefined();
  expect(thumb().getAttribute('aria-valuenow')).toBeNull();
});
