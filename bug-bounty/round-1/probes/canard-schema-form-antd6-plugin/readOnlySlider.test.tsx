import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../../fieldInputs/FieldInputSlider';

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as never;
afterEach(cleanup);

it('readOnly slider keeps the displayed value equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 0,
        maximum: 100,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={10}
    />,
  );
  const handle = container.querySelector<HTMLElement>('[role="slider"]')!;
  fireEvent.keyDown(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  fireEvent.keyUp(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  await act(async () => {});
  expect(ref.current!.getValue()).toBe(10);
  expect(handle.getAttribute('aria-valuenow')).toBe('10');
});
