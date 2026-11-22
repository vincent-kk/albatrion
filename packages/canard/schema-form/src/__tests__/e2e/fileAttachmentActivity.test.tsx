import * as React from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type InputRendererProps,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { file: { type: 'string' } },
} as const;

const FileInput = ({ onFileAttach }: FieldInputProps) => (
  <button type="button" onClick={() => onFileAttach(new File(['a'], 'a.txt'))}>
    Attach
  </button>
);

it.skipIf(!React.Activity).each([
  ['hide and show', true],
  ['remove while hidden', true],
  ['replace the attached container and hide', false],
] as const)(
  'preserves the specified attachment lifetime when hosts %s',
  async (action, remains) => {
    const ref = React.createRef<FormHandle>();
    let replaceContainer: () => void = () => {
      throw new Error('Expected a committed input renderer');
    };
    const Frame = ({ children }: InputRendererProps) => {
      const [alternate, setAlternate] = React.useState(false);
      replaceContainer = () => setAlternate(true);
      return alternate ? <section>{children}</section> : <div>{children}</div>;
    };
    const tree = (hidden: boolean, included: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        InputRenderer={Frame}
        validationMode={ValidationMode.None}
      >
        <React.Activity mode={hidden ? 'hidden' : 'visible'}>
          {included && <Form.Input path="/file" FieldInput={FileInput} />}
        </React.Activity>
      </Form>
    );

    const view = render(tree(false, true));
    const attached = () => ref.current!.getAttachedFilesMap().has('/file');
    fireEvent.click(screen.getByRole('button', { name: 'Attach' }));
    expect(attached()).toBe(true);
    if (action === 'replace the attached container and hide') {
      const oldButton = screen.getByRole('button', { name: 'Attach' });
      act(replaceContainer);
      expect(oldButton.isConnected).toBe(false);
      expect(attached()).toBe(true);
    }

    await act(async () => view.rerender(tree(true, true)));
    if (action === 'hide and show')
      await act(async () => view.rerender(tree(false, true)));
    else if (action === 'remove while hidden')
      await act(async () => view.rerender(tree(true, false)));
    expect(attached()).toBe(remains);
    if (action === 'remove while hidden') {
      await act(async () => ref.current!.reset());
      expect(attached()).toBe(false);
    }
  },
);
