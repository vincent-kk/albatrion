import { createRef, useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { name: { type: 'string', default: 'taken' } },
} as const;

const serverErrors = [
  { dataPath: '/name', keyword: 'server', message: 'This name is taken.' },
];

const App = ({
  formRef,
  fresh,
}: {
  formRef: React.RefObject<FormHandle | null>;
  fresh: boolean;
}) => {
  const [value, setValue] = useState<unknown>();
  return (
    <>
      <Form
        ref={formRef}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        errorVisibility={ErrorVisibility.Always}
        onChange={setValue}
        // Equal content; `fresh` gives it a new array identity on every render.
        errors={fresh ? [...serverErrors] : serverErrors}
      >
        <Form.Input path="/name" />
        <Form.ErrorMessage path="/name" />
      </Form>
      <pre>{JSON.stringify(value)}</pre>
    </>
  );
};

it.for([false, true])(
  'round-2 schema-form 4: typing clears the server error and an unrelated parent re-render keeps it cleared (new array identity=%s)',
  async (fresh) => {
    const ref = createRef<FormHandle>();
    const user = userEvent.setup();
    const view = render(<App formRef={ref} fresh={fresh} />);
    expect(ref.current!.getErrors().map((e) => e.keyword)).toEqual(['server']);
    const input = view.container.querySelector('input') as HTMLInputElement;
    await user.type(input, 'x');
    expect(ref.current!.getValue()).toEqual({ name: 'takenx' });
    expect(ref.current!.findNode('/name')!.errors).toEqual([]);
    expect(view.container.textContent).not.toContain('This name is taken.');
  },
);
