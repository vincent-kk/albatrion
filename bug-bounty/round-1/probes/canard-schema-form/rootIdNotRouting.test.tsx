import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

const build = (id?: string): JSONSchema => ({
  ...(id ? { $id: id } : {}),
  type: 'object',
  required: ['code'],
  properties: {
    code: { type: 'string', not: { const: 'admin' } },
  },
});

it.each([
  ['without $id', undefined],
  ['with root $id', 'urn:sf-validation:not-root'],
])('keeps a value-level not error on the string field (%s) with the shipped ajv8 plugin', async (_, id) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={build(id)}
      defaultValue={{ code: 'admin' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={plugin.validator}
    />,
  );
  let issues: readonly { keyword?: string; rejectedKey?: string }[] = [];
  await act(async () => {
    issues = await ref.current!.validate();
  });
  console.log(JSON.stringify(issues));
  expect({
    field: ref.current!.findNode('/code')!.errors.map((issue) => issue.keyword),
    root: ref.current!.node!.errors.map((issue) => issue.keyword),
  }).toEqual({ field: ['not'], root: [] });
  expect(issues.find((issue) => issue.keyword === 'not')?.rejectedKey).toBeUndefined();
});
