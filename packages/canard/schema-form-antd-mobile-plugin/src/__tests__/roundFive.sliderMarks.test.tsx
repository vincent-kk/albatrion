import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../fieldInputs/FieldInputSlider';

afterEach(cleanup);
it('round-5 neighbouring marks: unconstrained fractional stops agree with their explicit decimal grid', () => {
  const results = [];
  for (const multipleOf of [undefined, 0.5]) {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputSliderDefinition]}
        jsonSchema={{
          type: 'number',
          format: 'slider',
          minimum: 0,
          maximum: 3,
          ...(multipleOf === undefined ? {} : { multipleOf }),
          presentation: {
            FieldInputProps: { marks: { 0.5: 'Low', 2.5: 'High' } },
          },
        }}
        defaultValue={0.5}
      />,
    );
    const control = view.container.querySelector('[role="slider"]');
    if (!control) throw new Error('Missing slider control');
    fireEvent.keyDown(control, { key: 'ArrowRight' });
    fireEvent.keyUp(control, { key: 'ArrowRight' });
    results.push(ref.current!.getValue());
    view.unmount();
  }
  expect(results[0]).toBe(results[1]);
  expect(results).toEqual([2.5, 2.5]);
});

it.each([
  { key: 'End', lazy: undefined },
  { key: 'End', lazy: false },
  { key: 'Home', lazy: undefined },
  { key: 'Home', lazy: false },
])('selects the outer valid mark with $key (lazy=$lazy)', ({ key, lazy }) => {
  const ref = createRef<FormHandle>();
  const isEnd = key === 'End';
  const endpoint = isEnd ? 4.25 : 0.25;
  const excluded = isEnd ? 4.5 : 0;
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        ...(isEnd
          ? { minimum: 0, exclusiveMaximum: 4.5 }
          : { exclusiveMinimum: 0, maximum: 4.5 }),
        presentation: {
          FieldInputProps: {
            ...(lazy === undefined ? {} : { lazy }),
            marks: { 2: 'Middle', [endpoint]: 'Outer', [excluded]: 'Excluded' },
          },
        },
      }}
      defaultValue={2}
    />,
  );
  const thumb = screen.getByRole('slider');
  fireEvent.keyDown(thumb, { key });
  expect(ref.current!.getValue()).toBe(lazy === false ? endpoint : 2);
  fireEvent.keyUp(thumb, { key });
  expect(ref.current!.getValue()).toBe(endpoint);
  expect(screen.getByText('Outer')).toBeTruthy();
  expect(screen.queryByText('Excluded')).toBeNull();
  expect(thumb.getAttribute(isEnd ? 'aria-valuemax' : 'aria-valuemin')).toBe(
    String(endpoint),
  );
});
