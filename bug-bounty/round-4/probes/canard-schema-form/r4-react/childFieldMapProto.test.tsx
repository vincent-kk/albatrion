import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
  useChildFieldMap,
} from '@/schema-form';

afterEach(cleanup);

/**
 * Round 3 open lead (r3-react): useChildFieldMap reads a plain {} target, so a missing child whose
 * name is an Object.prototype member returns the inherited member. api-reference.mdx documents that
 * missing names render nothing. Round 3 class 24 (lookups that read inherited prototype keys).
 */
const createSchema = (name: string) =>
  ({
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          title: { type: 'string' },
          [name]: {
            type: 'string',
            controls: { active: '../on === true' },
          },
        },
      },
    },
  }) as const;

const createGroupInput = (name: string) =>
  function GroupInput({ ChildFields }: FieldInputProps) {
    const fields = useChildFieldMap<Record<string, unknown>>(ChildFields ?? []);
    const Optional = fields[name];
    const Title = fields.title;
    return (
      <div data-testid="group">
        <Title />
        <Optional />
      </div>
    );
  };

it.each(['constructor', 'toString', 'valueOf'])(
  'a missing child named %s renders nothing and keeps its siblings',
  async (name) => {
    const onError = vi.fn();
    const handle = createRef<FormHandle>();
    const view = render(
      <Form
        ref={handle}
        jsonSchema={createSchema(name)}
        fieldInputMap={{ '/group': createGroupInput(name) }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    await act(async () => {});
    const group = view.queryByTestId('group');
    expect({
      groupRendered: group !== null,
      titleInput: group?.querySelectorAll('input').length ?? 0,
      text: group?.textContent ?? '',
      errors: onError.mock.calls.length,
    }).toEqual({ groupRendered: true, titleInput: 1, text: '', errors: 0 });
  },
);

it('control: a missing child with an ordinary name renders nothing', async () => {
  const onError = vi.fn();
  const view = render(
    <Form
      jsonSchema={createSchema('extra')}
      fieldInputMap={{ '/group': createGroupInput('extra') }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  await act(async () => {});
  const group = view.getByTestId('group');
  expect(group.querySelectorAll('input').length).toBe(1);
  expect(onError).not.toHaveBeenCalled();
});
