import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

afterEach(cleanup);

const renderSlider = (defaultValue?: number, unsetValueText?: string) => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 10,
        maximum: 20,
        presentation: {
          inputType: 'slider',
          FieldInputProps: unsetValueText ? { unsetValueText } : undefined,
        },
      }}
      defaultValue={defaultValue}
    />,
  );
  const thumb = () =>
    container.querySelector<HTMLInputElement>('input[type="range"]')!;
  const thumbOpacity = () =>
    getComputedStyle(container.querySelector('.MuiSlider-thumb')!).opacity;
  return { ref, thumb, thumbOpacity };
};

it('slider with no value does not display a value the form does not hold', () => {
  const { ref, thumb } = renderSlider();
  expect(ref.current!.getValue()).toBeUndefined();
  expect(thumb().getAttribute('aria-valuenow')).toBeNull();
});

it('an unset slider hides its thumb until it holds a value', () => {
  const { thumb, thumbOpacity } = renderSlider();
  expect(thumbOpacity()).toBe('0');
  fireEvent.keyDown(thumb(), { key: 'End' });
  fireEvent.keyUp(thumb(), { key: 'End' });
  expect(thumbOpacity()).not.toBe('0');
});

it('control: an unset slider stays keyboard operable and its first change sets the chosen value', () => {
  const { ref, thumb } = renderSlider();
  act(() => thumb().focus());
  expect(document.activeElement).toBe(thumb());
  fireEvent.keyDown(thumb(), { key: 'End' });
  fireEvent.keyUp(thumb(), { key: 'End' });
  expect(ref.current!.getValue()).toBe(20);
  expect(thumb().getAttribute('aria-valuenow')).toBe('20');
});

it('control: a slider with a value displays it', () => {
  const { thumb, thumbOpacity } = renderSlider(15);
  expect(thumb().getAttribute('aria-valuenow')).toBe('15');
  expect(thumbOpacity()).not.toBe('0');
});

it('Home on an unset slider stores the minimum', () => {
  const { ref, thumb } = renderSlider();
  fireEvent.keyDown(thumb(), { key: 'Home' });
  fireEvent.keyUp(thumb(), { key: 'Home' });
  expect(ref.current!.getValue()).toBe(10);
  expect(thumb().getAttribute('aria-valuenow')).toBe('10');
});

it('an unset slider announces that it has no value instead of the minimum', () => {
  const { thumb } = renderSlider();
  expect(thumb().getAttribute('aria-valuetext')).toBe('Not set');
  fireEvent.keyDown(thumb(), { key: 'End' });
  fireEvent.keyUp(thumb(), { key: 'End' });
  expect(thumb().getAttribute('aria-valuetext')).toBeNull();
});

it('reads the unset announcement from presentation.FieldInputProps.unsetValueText', () => {
  const { thumb } = renderSlider(undefined, 'No rating');
  expect(thumb().getAttribute('aria-valuetext')).toBe('No rating');
});

it('control: a slider with a value has no unset announcement', () => {
  const { thumb } = renderSlider(15);
  expect(thumb().getAttribute('aria-valuetext')).toBeNull();
});

it('an external reset to undefined returns the slider to the unset state', async () => {
  const { ref, thumb } = renderSlider(15);
  expect(thumb().getAttribute('aria-valuenow')).toBe('15');
  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current!.getValue()).toBeUndefined();
  expect(thumb().getAttribute('aria-valuenow')).toBeNull();
});
