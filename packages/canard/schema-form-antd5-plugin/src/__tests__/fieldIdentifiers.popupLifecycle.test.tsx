import { createRef } from 'react';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it.each([
  {
    kind: 'enum',
    schema: { type: 'string', enum: ['one', 'two'] },
    value: 'one',
  },
  {
    kind: 'URI protocol',
    schema: { type: 'string', format: 'uri' },
    value: 'https://example.com',
  },
] satisfies { kind: string; schema: JSONSchema; value: string }[])(
  'pins the library-owned $kind popup reference lifecycle',
  async ({ schema, value }) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={value}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />,
    );
    const select = screen.getByRole('combobox');
    const listId = select.getAttribute('aria-controls');
    expect(listId).toBeTruthy();
    if (!listId) throw Error('Missing library list reference');
    expect(document.getElementById(listId)).toBeNull();
    fireEvent.mouseDown(select);
    await waitFor(() => expect(document.getElementById(listId)).not.toBeNull());
    expect(ref.current!.getValue()).toBe(value);
  },
);
