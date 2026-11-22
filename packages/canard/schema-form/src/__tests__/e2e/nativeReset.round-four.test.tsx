import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { text: { type: 'string' }, checked: { type: 'boolean' } },
} as const;

it('native reset follows handle reset while resetting unmanaged native controls', async () => {
  const run = async (native: boolean) => {
    const handle = createRef<FormHandle<typeof schema>>();
    const onChange = vi.fn();
    const view = render(
      <Form
        ref={handle}
        jsonSchema={schema}
        defaultValue={{ text: 'loaded', checked: true }}
        validationMode={ValidationMode.None}
        onChange={onChange}
      >
        <Form.Input path="/text" />
        <Form.Input path="/checked" />
        <input data-testid="unmanaged" defaultValue="outside" />
        <button type="reset">Reset</button>
      </Form>,
    );
    const text =
      view.container.querySelector<HTMLInputElement>('input[type="text"]');
    const checked = view.container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    const unmanaged = view.container.querySelector<HTMLInputElement>(
      '[data-testid="unmanaged"]',
    );
    if (!text || !checked || !unmanaged)
      throw new Error('Missing managed inputs');
    await act(async () => {
      fireEvent.change(text, { target: { value: 'edited' } });
      fireEvent.click(checked);
      fireEvent.change(unmanaged, { target: { value: 'outside edited' } });
    });
    onChange.mockClear();
    const events: number[] = [];
    const unsubscribe = handle.current?.node?.subscribe((event) =>
      events.push(event.type),
    );
    await act(async () => {
      if (native) fireEvent.click(view.getByText('Reset'));
      else handle.current?.reset();
    });
    unsubscribe?.();
    const result = {
      events,
      value: handle.current?.getValue(),
      text: view.container.querySelector<HTMLInputElement>('input[type="text"]')
        ?.value,
      checked: view.container.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )?.checked,
      changes: onChange.mock.calls.map((call) => call[0]),
    };
    if (native) expect(unmanaged.value).toBe('outside');
    view.unmount();
    return result;
  };
  const handle = await run(false);
  expect(handle.value).toEqual({ text: 'loaded', checked: true });
  expect(await run(true)).toEqual(handle);
});
