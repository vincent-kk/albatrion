import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '@/schema-form';

type SearchControlProps = Pick<FieldInputProps, 'focusRef' | 'inputId'> & {
  placeholder?: string;
};

function SearchControl({
  focusRef,
  inputId,
  ...attributes
}: SearchControlProps) {
  return <input {...attributes} id={inputId} ref={focusRef} type="search" />;
}

afterEach(cleanup);

it('forwards control attributes and focuses the connected search input', () => {
  const ref = createRef<FormHandle>();
  const SearchField = ({ focusRef, inputId }: FieldInputProps) => (
    <>
      <button type="button">Clear</button>
      <SearchControl
        focusRef={focusRef}
        inputId={inputId}
        placeholder="Search terms"
      />
    </>
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', presentation: { FieldInput: SearchField } }}
    />,
  );
  act(() => ref.current!.focus(''));
  expect(document.activeElement).toBe(
    view.getByPlaceholderText('Search terms'),
  );
});
