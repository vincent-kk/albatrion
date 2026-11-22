import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputTextareaDefinition } from '../../fieldInputs/FieldInputTextarea';

const received = vi.hoisted((): { autoSize: unknown[] } => ({ autoSize: [] }));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Input: Object.assign(actual.Input, {
      TextArea: (props: { autoSize?: unknown }) => {
        received.autoSize.push(props.autoSize);
        return null;
      },
    }),
  };
});

beforeEach(() => {
  received.autoSize.length = 0;
});
afterEach(cleanup);

describe('textarea rows settings (antd5)', () => {
  it('minRows and maxRows in presentation.FieldInputProps reach autoSize, as the README Input Settings section directs', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputTextareaDefinition]}
        jsonSchema={{
          type: 'string',
          format: 'textarea',
          presentation: { FieldInputProps: { minRows: 3, maxRows: 6 } },
        }}
      />,
    );
    expect(received.autoSize.at(-1)).toEqual({ minRows: 3, maxRows: 6 });
  });

  it('diagnostic: minRows and maxRows on the schema itself', () => {
    render(
      <Form
        fieldInputDefinitions={[FieldInputTextareaDefinition]}
        jsonSchema={{
          type: 'string',
          format: 'textarea',
          minRows: 3,
          maxRows: 6,
        } as any}
      />,
    );
    expect(received.autoSize.at(-1)).toEqual({ minRows: 3, maxRows: 6 });
  });
});
