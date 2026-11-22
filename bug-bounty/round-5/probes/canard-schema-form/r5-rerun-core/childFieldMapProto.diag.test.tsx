import { act, cleanup, render } from '@testing-library/react';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  ValidationMode,
  useChildFieldMap,
} from '@/schema-form';

/**
 * Diagnostic for the r4-react childFieldMapProto.test.tsx failure in the rerun: records the
 * actual group state (inputs, text, errors) for each name, including an ordinary name, so the
 * cause of the `text` difference can be told apart from the round 4 item 17 symptom.
 */

afterEach(cleanup);

const createSchema = (name: string) =>
  ({
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          title: { type: 'string' },
          [name]: { type: 'string', controls: { active: '../on === true' } },
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

it.each(['extra', 'constructor', 'toString', 'valueOf'])(
  '[diagnostic] group state with a missing child named %s',
  async (name) => {
    const onError = vi.fn();
    const view = render(
      <Form
        jsonSchema={createSchema(name)}
        fieldInputMap={{ '/group': createGroupInput(name) }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
    await act(async () => {});
    const group = view.queryByTestId('group');
    const actual = {
      groupRendered: group !== null,
      titleInput: group?.querySelectorAll('input').length ?? 0,
      text: group?.textContent ?? '',
      html: group?.innerHTML.replace(/ (id|for|aria-labelledby|name)="[^"]*"/g, '').slice(0, 400),
      errors: onError.mock.calls.map((call) => String(call[0]?.code ?? call[0])),
    };
    appendFileSync(
      join(tmpdir(), 'r5-rerun-core-diag.log'),
      `childFieldMapProto ${name} ${JSON.stringify(actual)}\n`,
    );
    expect(JSON.stringify(actual)).toBe('record');
  },
);
