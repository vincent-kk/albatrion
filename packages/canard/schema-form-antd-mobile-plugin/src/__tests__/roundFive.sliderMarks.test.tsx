import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
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
