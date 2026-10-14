import { expect, it } from 'vitest';

import { FieldInputStringCheckboxDefinition } from '@/schema-form/fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringRadioDefinition } from '@/schema-form/fieldInputs/FieldInputStringRadio';
import type { FieldInputHint, JSONSchema } from '@/schema-form/types';

import { isFieldInputGroup } from '../index';

const schemas: { name: string; schema: JSONSchema }[] = [
  {
    name: 'checkbox array of string enum',
    schema: {
      type: 'array',
      items: { type: 'string', enum: ['S', 'M'] },
      presentation: { inputType: 'checkbox' },
    },
  },
  {
    name: 'string enum array without inputType',
    schema: { type: 'array', items: { type: 'string', enum: ['S', 'M'] } },
  },
  {
    name: 'checkbox array of non-enum strings',
    schema: {
      type: 'array',
      items: { type: 'string' },
      presentation: { inputType: 'checkbox' },
    },
  },
  {
    name: 'radio string enum',
    schema: {
      type: 'string',
      enum: ['S', 'M'],
      presentation: { inputType: 'radio' },
    },
  },
  {
    name: 'radiogroup string enum',
    schema: {
      type: 'string',
      enum: ['S', 'M'],
      presentation: { inputType: 'radiogroup' },
    },
  },
  {
    name: 'string enum without inputType',
    schema: { type: 'string', enum: ['S', 'M'] },
  },
  {
    name: 'radio string without enum',
    schema: { type: 'string', presentation: { inputType: 'radio' } },
  },
  {
    name: 'radio number enum',
    schema: {
      type: 'number',
      enum: [1, 2],
      presentation: { inputType: 'radio' },
    },
  },
];

it.each(schemas)('agrees with builtin definitions for $name', ({ schema }) => {
  const type = schema.type;
  if (type !== 'array' && type !== 'string' && type !== 'number')
    throw new Error('Group input fixtures must have a scalar runtime kind');
  const hint: FieldInputHint = {
    type,
    schemaType: type,
    typeMismatch: false,
    path: '/field',
    required: false,
    nullable: false,
    jsonSchema: schema,
    format: typeof schema.format === 'string' ? schema.format : undefined,
    inputType:
      typeof schema.presentation?.inputType === 'string'
        ? schema.presentation.inputType
        : undefined,
  };
  expect(isFieldInputGroup(schema)).toBe(
    FieldInputStringCheckboxDefinition.test(hint) ||
      FieldInputStringRadioDefinition.test(hint),
  );
});
