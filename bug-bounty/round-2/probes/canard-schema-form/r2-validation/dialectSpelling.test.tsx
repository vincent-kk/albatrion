import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

it.each([
  'http://json-schema.org/draft-07/schema#',
  'http://json-schema.org/draft-07/schema',
])(
  'a draft-07 schema declaring $schema %j with the draft-07 AJV8 entry reports no dialect mismatch',
  async ($schema) => {
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const jsonSchema: JSONSchema = {
      $schema,
      type: 'object',
      properties: { name: { type: 'string', minLength: 2 } },
    };
    render(
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        defaultValue={{ name: 'a' }}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={plugin.validator}
        onError={onError}
      />,
    );
    let issues: unknown;
    await act(async () => {
      issues = (await ref.current!.validate()).map((issue) => issue.keyword);
    });
    // AJV itself treats both spellings as the same meta-schema and validates normally.
    expect(issues).toEqual(['minLength']);
    expect(onError.mock.calls.map(([record]) => record.code)).toEqual([]);
  },
);
