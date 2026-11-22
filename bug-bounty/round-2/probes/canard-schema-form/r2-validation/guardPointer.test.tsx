import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  type ValidatorFactory,
} from '@/schema-form';

afterEach(cleanup);

const recording = () => {
  const pointers: string[] = [];
  const failures: string[] = [];
  const validator: ValidatorFactory = {
    compile: (copy) => plugin.validator.compile(copy),
    compileGuard: (root, pointer) => {
      pointers.push(pointer);
      try {
        return plugin.validator.compileGuard(root, pointer);
      } catch (error) {
        failures.push(`${pointer}: ${(error as Error).message}`);
        throw error;
      }
    },
    release: (root) => plugin.validator.release?.(root),
    dialect: plugin.validator.dialect,
  };
  return { validator, pointers, failures };
};

const conditional = (withRef: boolean): JSONSchema => ({
  type: 'object',
  properties: {
    receipt: { type: 'boolean' },
  },
  allOf: [
    {
      if: {
        properties: {
          receipt: withRef ? { $ref: '#/definitions/Yes' } : { const: true },
        },
        required: ['receipt'],
      },
      then: {
        properties: { email: { type: 'string' } },
      },
    },
  ],
});

const run = async (name: string, withRef: boolean) => {
  const { validator, pointers, failures } = recording();
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        definitions: { Yes: { const: true } },
        properties: { [name]: conditional(withRef) },
      }}
      defaultValue={{ [name]: { receipt: true } }}
      validationMode={ValidationMode.None}
      validatorFactory={validator}
      onError={onError}
    />,
  );
  await act(async () => {});
  const email = ref.current!.getValue();
  const node = ref.current!.node.find(
    // find takes the form pointer grammar; escape the reserved name the way findNode documents
    '/' +
      (({ '@': '%40', '*': '%2A' } as Record<string, string>)[name] ?? name) +
      '/email',
  );
  return {
    pointers,
    failures,
    emailActive: node?.isActive ?? false,
    value: email,
  };
};

it.each([
  ['ab', false],
  ['a b', false],
  ['@', false],
  ['100%', true],
  ['a b', true],
  ['ab', true],
  ['100%', false],
  ['*', false],
])(
  'an if guard under property %j (if contains $ref: %s) compiles and activates its then field',
  async (name, withRef) => {
    const result = await run(name, withRef);
    console.log(JSON.stringify(result));
    expect(result.failures).toEqual([]);
    expect(result.emailActive).toBe(true);
  },
);
