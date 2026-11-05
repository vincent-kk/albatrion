import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FieldInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
});

it('a Select request selects the first text control, past a button that comes first', () => {
  const ButtonThenTextarea = ({ value }: FieldInputProps) => (
    <>
      <button type="button">clear</button>
      <textarea defaultValue={String(value ?? '')} />
    </>
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="text"
      fieldInputMap={{ '': ButtonThenTextarea }}
    />,
  );
  const textarea = view.container.querySelector('textarea')!;
  textarea.setSelectionRange(4, 4);
  act(() => ref.current!.select(''));
  expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([0, 4]);
});
