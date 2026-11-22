import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

const checkbox = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;

describe.each<[string, JSONSchema, object | undefined]>([
  ['unset boolean', { type: 'object', properties: { agree: { type: 'boolean' } } }, undefined],
  [
    'null nullable boolean',
    { type: 'object', properties: { agree: { type: ['boolean', 'null'] } } },
    { agree: null },
  ],
])('%s in a read-only form', (_name, schema, defaultValue) => {
  it('a click leaves the checkbox showing the stored value', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        readOnly
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        defaultValue={defaultValue}
        onError={() => {}}
      />,
    );
    const before = checkbox(container).checked;
    fireEvent.click(checkbox(container));
    await act(async () => {});
    const stored = (ref.current!.getValue() as { agree?: unknown }).agree;
    expect({ shown: checkbox(container).checked, stored }).toEqual({
      shown: before,
      stored: defaultValue ? null : undefined,
    });
  });
});

it('control: a stored false stays unchecked after a click in a read-only form', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      jsonSchema={{ type: 'object', properties: { agree: { type: 'boolean' } } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ agree: false }}
      onError={() => {}}
    />,
  );
  fireEvent.click(checkbox(container));
  await act(async () => {});
  expect(checkbox(container).checked).toBe(false);
  expect(ref.current!.getValue()).toEqual({ agree: false });
});
