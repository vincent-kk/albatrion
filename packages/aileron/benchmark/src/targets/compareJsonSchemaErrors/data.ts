import type { JsonSchemaError } from '@canard/schema-form';

export const ajvErrors1 = [
  {
    keyword: 'maxLength',
    dataPath: '.message',
    message: 'should NOT be longer than 20 characters',
  },
  {
    keyword: 'minLength',
    dataPath: '.username',
    message: 'should NOT be shorter than 5 characters',
  },
  {
    keyword: 'required',
    dataPath: '.email',
    message: "should have required property 'email'",
  },
  {
    keyword: 'pattern',
    dataPath: '.phoneNumber',
    message: 'should match pattern "^\\+?[1-9]\\d{1,14}$"',
  },
  {
    keyword: 'type',
    dataPath: '.age',
    message: 'should be integer',
  },
  {
    keyword: 'maximum',
    dataPath: '.price',
    message: 'should be <= 1000',
  },
] satisfies JsonSchemaError[];

export const ajvErrors2 = [
  {
    keyword: 'minimum',
    dataPath: '.quantity',
    message: 'should be >= 1',
  },
  {
    keyword: 'enum',
    dataPath: '.status',
    message: 'should be equal to one of the allowed values',
  },
  {
    keyword: 'maxItems',
    dataPath: '.tags',
    message: 'should NOT have more than 5 items',
  },
  {
    keyword: 'uniqueItems',
    dataPath: '.tags',
    message: 'should NOT have duplicate items',
  },
] satisfies JsonSchemaError[];
