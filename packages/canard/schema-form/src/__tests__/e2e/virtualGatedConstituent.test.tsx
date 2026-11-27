import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

/** Union field `data` narrowed to number while `flag` is true and grouped with `y` under `pair`. */
const schema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    data: { type: ['string', 'number'] },
    y: { type: 'string' },
  },
  options: { virtual: { pair: { fields: ['data', 'y'] } } },
  allOf: [
    {
      controls: { active: './flag === true' },
      properties: { data: { type: 'number' } },
    },
  ],
} as const;

/** Group input that shows the constituent's effective schema and writes a string tuple through the group. */
const Pair = ({ node, onChange }: FieldInputProps) => {
  const data = node.children?.find((child) => child.name === 'data');
  return (
    <button type="button" onClick={() => onChange(['5', 'b'])}>
      {JSON.stringify(data?.jsonSchema)}
    </button>
  );
};

it('mounts with a gate on that narrows a group constituent and reads a group write under it', async () => {
  const ref: { current: FormHandle | null } = { current: null };
  const view = render(
    <Form
      ref={(handle) => {
        ref.current = handle;
      }}
      jsonSchema={schema}
      defaultValue={{ flag: true, data: 4, y: 'a' }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/pair': Pair }}
    >
      <Form.Render path="/pair">{({ Input }) => <Input />}</Form.Render>
    </Form>,
  );
  const button = view.getByRole('button');
  expect(button.textContent).toBe('{"type":["number"]}');
  await act(async () => {
    fireEvent.click(button);
  });
  expect(ref.current?.getValue()).toEqual({ flag: true, data: 5, y: 'b' });
  expect(ref.current?.findNode('/data')?.isMisfit).toBe(false);
  expect(button.textContent).toBe('{"type":["number"]}');
});
