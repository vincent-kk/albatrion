import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  ValidationMode,
  useChildFieldMap,
} from '../../index';

afterEach(cleanup);

it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
  'missing %s behaves like an ordinary missing field',
  (name) => {
    const run = (key: string) => {
      const errors = vi.fn();
      const Group = ({ ChildFields }: FieldInputProps) => {
        const fields = useChildFieldMap<Record<string, unknown>>(
          ChildFields ?? [],
        );
        const Title = fields.title,
          Missing = fields[key];
        return (
          <div data-testid="group">
            <Title />
            <Missing />
          </div>
        );
      };
      const view = render(
        <Form
          jsonSchema={{
            type: 'object',
            properties: {
              group: {
                type: 'object',
                properties: { title: { type: 'string' } },
              },
            },
          }}
          fieldInputMap={{ '/group': Group }}
          validationMode={ValidationMode.None}
          onError={errors}
        />,
      );
      const group = view.queryByTestId('group');
      const result = {
        present: !!group,
        inputs: group?.querySelectorAll('input').length,
        text: group?.textContent,
        errors: errors.mock.calls.length,
      };
      view.unmount();
      return result;
    };
    const ordinary = run('missing');
    expect(ordinary).toEqual({ present: true, inputs: 1, text: 'title', errors: 0 });
    expect(run(name)).toEqual(ordinary);
  },
);
