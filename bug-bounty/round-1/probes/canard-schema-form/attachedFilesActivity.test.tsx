import * as React from 'react';
import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, inject, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

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

const Activity = (React as any).Activity as React.ComponentType<{
  mode: 'visible' | 'hidden';
  children: React.ReactNode;
}>;

it.skipIf(inject('reactMajor') !== '19')(
  'hiding a file input step with Activity keeps its attached files in the form',
  async () => {
    const ref = createRef<FormHandle>();
    const tree = (hidden: boolean) => (
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
        <Activity mode={hidden ? 'hidden' : 'visible'}>
          <Form.Input path="/file" FieldInput={FileInput} />
        </Activity>
        <Form.Input path="/note" />
      </Form>
    );
    const view = render(tree(false));
    await act(async () => {
      fireEvent.click(view.container.querySelector('[data-attach]')!);
    });
    expect(ref.current!.getValue()).toEqual({ file: 'a.txt' });
    expect([...ref.current!.getAttachedFilesMap().keys()]).toEqual(['/file']);
    view.rerender(tree(true));
    await act(async () => {});
    expect(ref.current!.getValue()).toEqual({ file: 'a.txt' });
    expect([...ref.current!.getAttachedFilesMap().keys()]).toEqual(['/file']);
    view.rerender(tree(false));
    await act(async () => {});
    expect([...ref.current!.getAttachedFilesMap().keys()]).toEqual(['/file']);
  },
);
