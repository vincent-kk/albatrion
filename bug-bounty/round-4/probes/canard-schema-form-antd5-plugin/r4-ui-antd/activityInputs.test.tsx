import { Activity, createRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(cleanup);

const schema: JSONSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    count: { type: 'number' },
    size: { type: 'string', enum: ['s', 'm'], presentation: { inputType: 'radio' } },
    tags: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    level: { type: 'number', presentation: { inputType: 'slider' } },
  },
};

let toggle: (visible: boolean) => void = () => {};
const Harness = ({ formRef }: { formRef: React.Ref<FormHandle> }) => {
  const [visible, setVisible] = useState(true);
  toggle = setVisible;
  return (
    <Activity mode={visible ? 'visible' : 'hidden'}>
      <Form
        ref={formRef}
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        defaultValue={{ text: 'a', count: 1, size: 's', tags: ['a'], level: 3 }}
        onError={() => {}}
      />
    </Activity>
  );
};

const display = (container: HTMLElement) => ({
  text: container.querySelector<HTMLInputElement>('[data-path="/text"] input')!.value,
  count: container.querySelector<HTMLInputElement>('[data-path="/count"] input')!.value,
  size: Array.from(
    container.querySelectorAll<HTMLInputElement>('[data-path="/size"] input'),
    (input) => input.checked,
  ),
  tags: Array.from(
    container.querySelectorAll<HTMLInputElement>('[data-path="/tags"] input'),
    (input) => input.checked,
  ),
  level: container
    .querySelector('[data-path="/level"] [role="slider"]')!
    .getAttribute('aria-valuenow'),
  handleId: container.querySelector('[data-path="/level"] [role="slider"]')!.id,
});

it('edited inputs keep the stored values and their display across an Activity hide and show', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(<Harness formRef={ref} />);
  fireEvent.change(container.querySelector('[data-path="/text"] input')!, {
    target: { value: 'edited' },
  });
  fireEvent.click(container.querySelectorAll('[data-path="/size"] input')[1]);
  fireEvent.click(container.querySelectorAll('[data-path="/tags"] input')[1]);
  await act(async () => {});
  const before = { value: ref.current!.getValue(), shown: display(container) };
  await act(async () => toggle(false));
  await act(async () => toggle(true));
  expect({ value: ref.current!.getValue(), shown: display(container) }).toEqual(before);
});
