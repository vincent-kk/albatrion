// filid:contract owned-inline-render
import { Suspense, createElement, lazy, useState } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';

import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  Form,
  type FormTypeInputProps,
  type FormTypeRendererProps,
} from '@/schema-form';

it('loads the selected React build and renders authored lazy input and inline JSX labels', async () => {
  const production = process.env.NODE_ENV === 'production';
  expect(hasOwnProperty(createElement('div'), '_store')).toBe(!production);
  const errors: unknown[] = [];
  const input = (props: FormTypeInputProps) => (
    <input data-owned-input value={String(props.value ?? '')} readOnly />
  );
  const Renderer = ({ Input, label }: FormTypeRendererProps) => (
    <div>
      {label}
      <Input />
    </div>
  );
  const LazyInput = lazy(async () => ({ default: input }));
  const style = { color: 'red' };
  const authoredProps = { style };
  let update: (() => void) | undefined;
  let authored: object | undefined;
  const View = () => {
    const [label, setLabel] = useState('first label');
    update = () => setLabel('second label');
    const schema = {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string' as const,
          default: 'ready',
          presentation: {
            FormTypeInput: LazyInput,
            FormTypeInputProps: authoredProps,
            FormTypeRendererProps: {
              label: <span data-owned-label>{label}</span>,
            },
          },
        },
      },
    };
    authored = schema;
    return (
      <Suspense fallback={<span data-owned-pending>pending</span>}>
        <Form
          key={label}
          jsonSchema={schema}
          validationMode={0}
          FormTypeGroupRenderer={Renderer}
          onError={(error) => {
            if (error.code !== 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING')
              errors.push(error);
          }}
        />
      </Suspense>
    );
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<View />));
    for (let turn = 0; turn < 20; turn++) await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 20));
    flushSync(() => root.render(<View />));
    expect(container.querySelector('[data-owned-input]')).not.toBeNull();
    expect(container.textContent).toContain('first label');
    flushSync(() => update?.());
    for (let turn = 0; turn < 20; turn++) await Promise.resolve();
    expect(container.textContent).toContain('second label');
    expect(errors).toEqual([]);
    expect(Object.isFrozen(LazyInput)).toBe(false);
    expect(Object.isFrozen(authored)).toBe(false);
    expect(Object.isFrozen(authoredProps)).toBe(false);
    expect(Object.isFrozen(style)).toBe(false);
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
});
