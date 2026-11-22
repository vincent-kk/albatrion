import { createRef } from 'react';

import { createValidator } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  FormWarningCode,
  type JSONSchema,
  ValidationMode,
} from '../../index';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([
  ['http://json-schema.org/draft-07/schema#', true],
  ['https://json-schema.org/draft/2019-09/schema', false],
  ['https://json-schema.org/draft/2020-12/schema', false],
] as const)(
  'accepts fragment $id in dialect %s only when allowed',
  ($schema, accepted) => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    vi.stubGlobal('reportError', vi.fn());
    const mount = () =>
      render(
        <Form
          ref={ref}
          onError={onError}
          validationMode={ValidationMode.None}
          jsonSchema={{
            $schema,
            type: 'object',
            properties: { home: { $ref: '#/definitions/address' } },
            definitions: {
              address: { $id: '#address', type: 'string', default: 'house' },
            },
          }}
        />,
      );
    mount();
    if (!accepted) {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: FormErrorCode.UnknownJsonSchema }),
      );
      expect(ref.current?.node).toBeFalsy();
      return;
    }
    expect(ref.current!.getValue()).toEqual({ home: 'house' });
  },
);

it.each([
  ['id', 'http://json-schema.org/draft-04/schema#'],
  ['$id', 'http://json-schema.org/draft-07/schema#'],
] as const)(
  'resolves a local fragment inside an embedded %s from every entry',
  (id, $schema) => {
    const address = {
      [id]: 'address.json',
      type: 'object',
      definitions: { kind: { type: 'string', default: 'house' } },
      properties: { kind: { $ref: '#/definitions/kind' } },
    } as const;
    const entries = [
      { $ref: '#/definitions/address' },
      { $ref: 'address.json' },
      address,
      {
        type: 'object',
        properties: { kind: { $ref: '#/definitions/address/properties/kind' } },
      },
    ] as const;

    for (const home of entries) {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          validationMode={ValidationMode.None}
          jsonSchema={{
            $schema,
            [id]: 'https://example.test/root.json',
            type: 'object',
            definitions: {
              kind: { type: 'number' },
              address,
            },
            properties: { home },
          }}
        />,
      );
      expect(ref.current!.getValue()).toEqual({ home: { kind: 'house' } });
      view.unmount();
    }
  },
);

const conditionalBranch = {
  if: { required: ['kind'] },
  then: { properties: { x: { type: 'string' } } },
} as const;
const nullBranch = {
  type: 'null',
  properties: { x: { type: 'string' } },
} as const;
const ifWarning = FormWarningCode.IfWithoutElseFalse;
const nullWarning = FormWarningCode.NullBranchIgnoredForForm;
const allOfWarning = FormWarningCode.AllOfKeywordIgnoredForForm;

it.each([
  ['oneOf conditional branch', 'oneOf', ifWarning, conditionalBranch],
  ['anyOf conditional branch', 'anyOf', ifWarning, conditionalBranch],
  ['oneOf null branch', 'oneOf', nullWarning, nullBranch],
  ['anyOf null branch', 'anyOf', nullWarning, nullBranch],
  ['allOf not', 'allOf', allOfWarning, { not: { required: ['kind'] } }],
  ['allOf contains', 'allOf', allOfWarning, { contains: { type: 'string' } }],
  [
    'allOf dependentRequired',
    'allOf',
    allOfWarning,
    { dependentRequired: { name: ['other'] } },
  ],
  [
    'allOf unevaluatedProperties',
    'allOf',
    allOfWarning,
    { unevaluatedProperties: false },
  ],
] as const)(
  '%s reports the same diagnostic inline and by reference',
  (_name, keyword, code, branch) => {
    const warnings = (referenced: boolean) => {
      const received: string[] = [];
      const candidates = [referenced ? { $ref: '#/$defs/branch' } : branch];
      const jsonSchema: JSONSchema = {
        type: ['object', 'null'],
        $defs: { branch },
        [keyword]:
          keyword === 'allOf'
            ? candidates
            : [
                ...candidates,
                { type: 'object', properties: { y: { type: 'string' } } },
              ],
      };
      const view = render(
        <Form
          jsonSchema={jsonSchema}
          validationMode={ValidationMode.None}
          onError={(record) => received.push(record.code)}
        />,
      );
      view.unmount();
      return received.filter((item) => item === code);
    };
    expect(warnings(false)).toEqual([code]);
    expect(warnings(true)).toEqual([code]);
  },
);

it('rejects a reference to a document outside the authored schema', () => {
  const external = 'https://example.test/other.json';
  const ajv = new Ajv();
  ajv.addSchema({ type: 'string' }, external);
  expect(ajv.validate(external, 'valid')).toBe(true);
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  render(
    <Form
      onError={onError}
      jsonSchema={{
        type: 'object',
        $defs: { missing: { $ref: external } },
        properties: { entry: { $ref: '#/$defs/missing' } },
      }}
      validatorFactory={createValidator(ajv)}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ code: FormErrorCode.UnknownJsonSchema }),
  );
});

it('resolves $defs locally for both the form value and a validator using the same schema', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        $id: 'https://example.test/root.json',
        type: 'object',
        $defs: {
          value: { type: 'number' },
          resource: {
            $id: 'nested.json',
            type: 'object',
            $defs: { value: { type: 'string', default: 'nested' } },
            properties: { value: { $ref: '#/$defs/value' } },
          },
        },
        properties: { entry: { $ref: '#/$defs/resource' } },
      }}
      validatorFactory={createValidator(new Ajv())}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  expect(ref.current!.getValue()).toEqual({ entry: { value: 'nested' } });
  await act(async () => {
    await expect(ref.current!.validate()).resolves.toEqual([]);
  });
});
