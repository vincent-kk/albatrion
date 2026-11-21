import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  ValidationMode,
  isArrayNode,
} from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['a', 'b', 'c'],
            presentation: { inputType: 'radio' },
          },
        },
      },
    },
  },
} as const;

it.each([
  'insert-empty',
  'insert-selected',
  'push',
  'remove',
  'update',
  'pop',
  'clear',
] as const)(
  'DOM radio selections equal stored selections after %s',
  async (operation) => {
    const handle = createRef<FormHandle<typeof schema>>();
    const view = render(
      <Form
        ref={handle}
        jsonSchema={schema}
        defaultValue={{ items: [{ kind: 'a' }, { kind: 'b' }] }}
        validationMode={ValidationMode.None}
      />,
    );
    const list = handle.current?.findNode('/items');
    if (!isArrayNode(list)) throw new Error('Expected array');
    await act(async () => {
      if (operation === 'insert-empty') list.insert(0);
      else if (operation === 'insert-selected') list.insert(0, { kind: 'c' });
      else if (operation === 'push') list.push({ kind: 'c' });
      else if (operation === 'remove') list.remove(0);
      else if (operation === 'update') list.update(0, { kind: 'c' });
      else if (operation === 'pop') list.pop();
      else list.clear();
    });
    const shown = Array.from(
      view.container.querySelectorAll('[role="group"]'),
      (group) =>
        group.querySelector<HTMLInputElement>('input:checked')?.value ?? null,
    );
    const stored = list.children?.map(
      (node) => node.find('kind')?.value ?? null,
    );
    expect(shown).toEqual(stored);
  },
);
