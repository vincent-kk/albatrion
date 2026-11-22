import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/**
 * Round 1 class 13 (uncontrolled widgets whose display diverges from the form value), new mechanism:
 * the Form renders a native <form>, whose reset button restores each uncontrolled control to its
 * defaultValue without an input event. Predictability: what the screen shows is what submit sends.
 */
const schema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

it('a native reset button leaves the screen and the submitted value in agreement', async () => {
  const onSubmit = vi.fn();
  const handle = createRef<FormHandle<typeof schema>>();
  const view = render(
    <Form
      ref={handle}
      jsonSchema={schema}
      defaultValue={{ name: 'loaded' }}
      validationMode={ValidationMode.None}
      onSubmit={onSubmit}
    >
      <Form.Input path="/name" />
      <button type="reset">Reset</button>
    </Form>,
  );
  const input = view.container.querySelector('input') as HTMLInputElement;
  await act(async () => {
    fireEvent.change(input, { target: { value: 'typed' } });
  });
  expect(handle.current!.getValue()).toEqual({ name: 'typed' });
  await act(async () => {
    fireEvent.click(view.getByText('Reset'));
  });
  await act(async () => {
    await handle.current!.submit();
  });
  expect({
    shown: input.value,
    submitted: onSubmit.mock.calls[0]?.[0],
  }).toEqual({
    shown: onSubmit.mock.calls[0]?.[0]?.name,
    submitted: { name: input.value },
  });
});
