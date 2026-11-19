import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it.each([null, undefined])(
  'checkbox display follows stored changes from %s',
  (initial) => {
    const ref = createRef<FormHandle>();
    const { unmount } = render(
      <Form
        ref={ref}
        jsonSchema={{ type: ['boolean', 'null'] }}
        defaultValue={initial}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    fireEvent.click(box);
    expect(ref.current!.getValue()).toBe(true);
    const clicked = {
      checked: box.checked,
      mixed: box.getAttribute('data-indeterminate'),
    };
    unmount();
    render(
      <Form
        jsonSchema={{ type: ['boolean', 'null'] }}
        defaultValue={true}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const loaded = screen.getByRole<HTMLInputElement>('checkbox');
    expect(clicked).toEqual({
      checked: loaded.checked,
      mixed: loaded.getAttribute('data-indeterminate'),
    });
  },
);
