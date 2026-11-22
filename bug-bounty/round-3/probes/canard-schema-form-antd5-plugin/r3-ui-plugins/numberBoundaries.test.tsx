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
  return { ref, input };
};

describe('number input boundaries (antd5)', () => {
  it('typing 1e21 stores 1e21', () => {
    const { ref, input } = renderNumber({ type: 'number' });
    fireEvent.change(input, { target: { value: '1e21' } });
    expect(ref.current!.getValue()).toEqual({ n: 1e21 });
  });

  it('typing -0 stores a zero', () => {
    const { ref, input } = renderNumber({ type: 'number' });
    fireEvent.change(input, { target: { value: '-0' } });
    expect(ref.current!.getValue().n === 0).toBe(true);
  });

  it('stepping 0.2 up by multipleOf 0.1 stores exactly 0.3', () => {
    const { ref, input } = renderNumber(
      { type: 'number', multipleOf: 0.1 },
      0.2,
    );
    act(() => {
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp', which: 38 });
    });
    expect(ref.current!.getValue()).toEqual({ n: 0.3 });
    expect(input.value).toBe('0.3');
  });

  it('an integer above MAX_SAFE_INTEGER shows the value the form stores after a step', () => {
    const { ref, input } = renderNumber(
      { type: 'integer' },
      Number.MAX_SAFE_INTEGER,
    );
    act(() => {
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp', which: 38 });
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp', which: 38 });
    });
    act(() => {
      fireEvent.blur(input);
    });
    expect(input.value).toBe(String(ref.current!.getValue().n));
  });
});
