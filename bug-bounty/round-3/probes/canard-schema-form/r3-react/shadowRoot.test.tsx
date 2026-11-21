import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

const hosts: HTMLElement[] = [];
afterEach(() => {
  cleanup();
  for (const host of hosts.splice(0)) host.remove();
});

/** EQ4: the same Form rendered into a light DOM container and into an open shadow root. */
const mountTarget = (shadow: boolean) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  hosts.push(host);
  if (!shadow) return { container: host, scope: document as Document | ShadowRoot };
  const root = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  root.appendChild(container);
  return { container, scope: root as Document | ShadowRoot };
};

const schema = {
  type: 'object',
  properties: {
    first: { type: 'string', default: 'x' },
    agree: { type: 'boolean' },
    name: { type: 'string', minLength: 3 },
  },
  required: ['name'],
} as const;

it.for([false, true])(
  'shadow=%s: clicking a field label toggles its boolean input',
  (shadow) => {
    const { container } = mountTarget(shadow);
    const ref = createRef<FormHandle<typeof schema>>();
    render(
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />,
      { container },
    );
    const label = container.querySelector<HTMLLabelElement>('label[for="/agree"]')!;
    act(() => {
      fireEvent.click(label);
    });
    expect(ref.current?.getValue()?.agree).toBe(true);
  },
);

it.for([false, true])(
  'shadow=%s: FormHandle.focus(path) focuses the field input',
  (shadow) => {
    const { container, scope } = mountTarget(shadow);
    const ref = createRef<FormHandle<typeof schema>>();
    render(
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />,
      { container },
    );
    act(() => {
      ref.current?.focus('/name');
    });
    expect((scope.activeElement as HTMLElement | null)?.id).toBe('/name');
  },
);

it.for([false, true])(
  'shadow=%s: native submit of an invalid form focuses the first invalid input',
  async (shadow) => {
    const { container, scope } = mountTarget(shadow);
    const ref = createRef<FormHandle<typeof schema>>();
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validatorFactory={plugin.validator}
        errorVisibility={ErrorVisibility.AfterEditAndTouch}
      >
        <Form.Input path="/first" />
        <Form.Input path="/name" />
        <Form.ErrorMessage path="/name" />
        <button type="submit">go</button>
      </Form>,
      { container },
    );
    const button = container.querySelector('button')!;
    button.focus();
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    await waitFor(() =>
      expect((scope.activeElement as HTMLElement | null)?.id).toBe('/name'),
    );
  },
);
