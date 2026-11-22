import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../../fieldInputs/FieldInputNumber';

afterEach(cleanup);

const renderNumber = (schema: object, defaultValue?: number) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type: 'object', properties: { n: schema } }}
      defaultValue={defaultValue === undefined ? {} : { n: defaultValue }}
      onError={() => {}}
    />,
  );
  const input = view.container.querySelector('input') as HTMLInputElement;
  const plus = view.container.querySelector(
    '.adm-stepper-plus',
  ) as HTMLButtonElement;
  return { ref, input, plus };
};

describe('number stepper boundaries (antd-mobile)', () => {
  it('typing 1e21 stores 1e21', () => {
    const { ref, input } = renderNumber({ type: 'number' });
    act(() => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '1e21' } });
    });
    expect(ref.current!.getValue()).toEqual({ n: 1e21 });
  });

  it('typing -0 stores a zero', () => {
    const { ref, input } = renderNumber({ type: 'number' });
    act(() => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '-0' } });
    });
    expect(ref.current!.getValue().n === 0).toBe(true);
  });

  it('stepping 0.2 up by multipleOf 0.1 stores exactly 0.3', () => {
    const { ref, plus, input } = renderNumber(
      { type: 'number', multipleOf: 0.1 },
      0.2,
    );
    act(() => {
      fireEvent.click(plus);
    });
    expect(ref.current!.getValue()).toEqual({ n: 0.3 });
    expect(input.value).toBe('0.3');
  });

  it('diagnostic: typing a grouped number 1,000 keeps the partial value 1', () => {
    const { ref, input } = renderNumber({ type: 'number' });
    act(() => {
      fireEvent.focus(input);
    });
    for (const text of ['1', '1,', '1,0', '1,00', '1,000'])
      act(() => {
        fireEvent.change(input, { target: { value: text } });
      });
    act(() => {
      fireEvent.blur(input);
    });
    expect([ref.current!.getValue(), input.value]).toEqual([{ n: 1 }, '1']);
  });
});
