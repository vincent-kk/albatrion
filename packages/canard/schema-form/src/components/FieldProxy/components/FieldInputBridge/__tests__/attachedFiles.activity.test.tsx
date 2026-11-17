import * as React from 'react';
import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { file: { type: 'string' }, note: { type: 'string' } },
} as const;

const FileInput = ({ onFileAttach, onChange }: FieldInputProps) => (
  <button
    type="button"
    data-attach=""
    onClick={() => {
      onFileAttach(new File(['x'], 'a.txt'));
      onChange('a.txt');
    }}
  />
);

const attachedPaths = (ref: React.RefObject<FormHandle | null>) => [
  ...ref.current!.getAttachedFilesMap().keys(),
];

it.skipIf(!React.Activity)(
  'hiding a file input with Activity keeps its attached files in the form',
  async () => {
    const ref = createRef<FormHandle>();
    const tree = (hidden: boolean) => (
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
        <React.Activity mode={hidden ? 'hidden' : 'visible'}>
          <Form.Input path="/file" FieldInput={FileInput} />
        </React.Activity>
        <Form.Input path="/note" />
      </Form>
    );
    const view = render(tree(false));
    await act(async () => {
      fireEvent.click(view.container.querySelector('[data-attach]')!);
    });
    expect(attachedPaths(ref)).toEqual(['/file']);
    view.rerender(tree(true));
    await act(async () => {});
    expect(ref.current!.getValue()).toEqual({ file: 'a.txt' });
    expect(attachedPaths(ref)).toEqual(['/file']);
    view.rerender(tree(false));
    await act(async () => {});
    expect(attachedPaths(ref)).toEqual(['/file']);
  },
);
