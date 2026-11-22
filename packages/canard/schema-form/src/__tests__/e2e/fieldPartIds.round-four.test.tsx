import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

it.each(['radio', 'checkbox'] as const)(
  'option and sibling labels are independent for %s',
  async (kind) => {
    const run = async (name: string) => {
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          validationMode={ValidationMode.None}
          jsonSchema={{
            type: 'object',
            properties: {
              choice:
                kind === 'radio'
                  ? {
                      type: 'string',
                      enum: ['a', 'b'],
                      presentation: { inputType: 'radio' },
                    }
                  : {
                      type: 'array',
                      items: { type: 'string', enum: ['a', 'b'] },
                      presentation: { inputType: 'checkbox' },
                    },
              [name]: { type: 'string' },
            },
          }}
          defaultValue={kind === 'radio' ? { choice: 'a' } : { choice: [] }}
        />,
      );
      const ids = Array.from(
        view.container.querySelectorAll('[id]'),
        (element) => element.id,
      );
      const label = Array.from(view.container.querySelectorAll('label')).find(
        (element) => element.textContent === name,
      );
      if (!label) throw new Error('Missing sibling label');
      const before = handle.current?.getValue();
      await act(async () => {
        fireEvent.click(label);
      });
      const result = {
        duplicates: ids.length - new Set(ids).size,
        unchanged:
          JSON.stringify(handle.current?.getValue()) === JSON.stringify(before),
        control: label.control?.getAttribute('type'),
      };
      view.unmount();
      return result;
    };
    const ordinary = await run('note');
    expect(ordinary).toEqual({
      duplicates: 0,
      unchanged: true,
      control: 'text',
    });
    expect(await run('choice-0')).toEqual(ordinary);
    expect(await run('choice-1')).toEqual(ordinary);
  },
);
