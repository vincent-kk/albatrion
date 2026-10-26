import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { isArray, isFunction } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  type FieldInputDefinition,
  type FieldInputHint,
  type FieldInputTestObject,
  Form,
  ValidationMode,
} from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputUnionDefinition } from '../FieldInputUnion';
import { fieldInputDefinitions } from '../index';

afterEach(cleanup);

const testKeys = [
  'type',
  'schemaType',
  'path',
  'required',
  'nullable',
  'format',
  'inputType',
] as const satisfies readonly (keyof FieldInputTestObject)[];

const matchesDefinition = (
  definition: FieldInputDefinition,
  hint: FieldInputHint,
): boolean => {
  const { test } = definition;
  if (isFunction(test)) return test(hint);
  return testKeys
    .filter((key) => hasOwnProperty(test, key))
    .every((key) => {
      const reference: unknown = test[key];
      const subject: unknown = hint[key];
      return isArray(reference)
        ? reference.includes(subject)
        : reference === subject;
    });
};

const n1Hint: FieldInputHint = {
  type: 'union',
  schemaType: ['string', 'number'],
  misfit: false,
  path: '/n1',
  required: false,
  nullable: false,
  jsonSchema: { type: ['string', 'number'] },
};

const n2Hint: FieldInputHint = {
  type: 'union',
  schemaType: ['string', 'number'],
  misfit: false,
  path: '/n2',
  required: false,
  nullable: true,
  jsonSchema: { type: ['string', 'number', 'null'] },
};

const n3Hint: FieldInputHint = {
  type: 'union',
  schemaType: ['object', 'string'],
  misfit: false,
  path: '/n3',
  required: false,
  nullable: false,
  jsonSchema: { type: ['object', 'string'] },
};

const n4Hint: FieldInputHint = {
  type: 'string',
  schemaType: 'string',
  misfit: false,
  path: '/n4',
  required: false,
  nullable: true,
  jsonSchema: { type: ['string', 'null'] },
};

const n5Hint: FieldInputHint = {
  type: 'number',
  schemaType: 'integer',
  misfit: false,
  path: '/n5',
  required: false,
  nullable: true,
  jsonSchema: { type: ['integer', 'null'] },
};

it('REACT-033 places FieldInputUnionDefinition immediately before FieldInputStringDefinition and matches N1-N3 while N4-N5 route to existing definitions', () => {
  const unionIndex = fieldInputDefinitions.indexOf(FieldInputUnionDefinition);
  const stringIndex = fieldInputDefinitions.indexOf(FieldInputStringDefinition);
  expect(unionIndex).toBeGreaterThanOrEqual(0);
  expect(stringIndex).toBe(unionIndex + 1);

  expect(matchesDefinition(FieldInputUnionDefinition, n1Hint)).toBe(true);
  expect(matchesDefinition(FieldInputUnionDefinition, n2Hint)).toBe(true);
  expect(matchesDefinition(FieldInputUnionDefinition, n3Hint)).toBe(true);
  expect(matchesDefinition(FieldInputUnionDefinition, n4Hint)).toBe(false);
  expect(matchesDefinition(FieldInputUnionDefinition, n5Hint)).toBe(false);

  expect(
    fieldInputDefinitions.find((def) => matchesDefinition(def, n1Hint)),
  ).toBe(FieldInputUnionDefinition);
  expect(
    fieldInputDefinitions.find((def) => matchesDefinition(def, n2Hint)),
  ).toBe(FieldInputUnionDefinition);
  expect(
    fieldInputDefinitions.find((def) => matchesDefinition(def, n3Hint)),
  ).toBe(FieldInputUnionDefinition);
  expect(
    fieldInputDefinitions.find((def) => matchesDefinition(def, n4Hint)),
  ).toBe(FieldInputStringDefinition);
  expect(
    fieldInputDefinitions.find((def) => matchesDefinition(def, n5Hint)),
  ).toBe(FieldInputNumberDefinition);
});

it('REACT-033 renders N1-N3 through FieldInputUnion and N4-N5 through string/number definitions in a live Form', () => {
  const view = render(
    <Form
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          n1: { type: ['string', 'number'] },
          n2: { type: ['string', 'number', 'null'] },
          n3: { type: ['object', 'string'] },
          n4: { type: ['string', 'null'] },
          n5: { type: ['integer', 'null'] },
        },
      }}
      defaultValue={{ n3: { k: 1 }, n4: 'hello', n5: 10 }}
      validationMode={ValidationMode.None}
    />,
  );
  const n3Input = view.container.querySelector('input[id="/n3"]');
  if (!(n3Input instanceof HTMLInputElement))
    throw new Error('Expected a native textbox for /n3');
  expect(n3Input.readOnly).toBe(true);
  expect(n3Input.value).toBe('{"k":1}');
  expect(view.container.querySelector('input[id="/n4"]')).not.toBeNull();
  expect(view.container.querySelector('.adm-stepper')).not.toBeNull();
});
