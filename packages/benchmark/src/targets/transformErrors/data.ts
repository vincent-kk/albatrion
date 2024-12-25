import type { JsonSchemaError } from '@canard/schema-form/src/types';

export const ajvErrors = [
  {
    keyword: 'maxLength',
    dataPath: '.message',
    instancePath: '/message',
    schemaPath: '#/properties/message/maxLength',
    params: {
      limit: 20,
    },
    message: 'should NOT be longer than 20 characters',
  },
  {
    keyword: 'minLength',
    dataPath: '.username',
    instancePath: '/username',
    schemaPath: '#/properties/username/minLength',
    params: {
      limit: 5,
    },
    message: 'should NOT be shorter than 5 characters',
  },
  {
    keyword: 'required',
    dataPath: '',
    instancePath: '',
    schemaPath: '#/required',
    params: {
      missingProperty: 'email',
    },
    message: "should have required property 'email'",
  },
  {
    keyword: 'pattern',
    dataPath: '.phoneNumber',
    instancePath: '/phoneNumber',
    schemaPath: '#/properties/phoneNumber/pattern',
    params: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
    },
    message: 'should match pattern "^\\+?[1-9]\\d{1,14}$"',
  },
  {
    keyword: 'type',
    dataPath: '.age',
    instancePath: '/age',
    schemaPath: '#/properties/age/type',
    params: {
      type: 'integer',
    },
    message: 'should be integer',
  },
  {
    keyword: 'maximum',
    dataPath: '.price',
    instancePath: '/price',
    schemaPath: '#/properties/price/maximum',
    params: {
      limit: 1000,
    },
    message: 'should be <= 1000',
  },
  {
    keyword: 'minimum',
    dataPath: '.quantity',
    instancePath: '/quantity',
    schemaPath: '#/properties/quantity/minimum',
    params: {
      limit: 1,
    },
    message: 'should be >= 1',
  },
  {
    keyword: 'enum',
    dataPath: '.status',
    instancePath: '/status',
    schemaPath: '#/properties/status/enum',
    params: {
      allowedValues: ['active', 'inactive', 'pending'],
    },
    message: 'should be equal to one of the allowed values',
  },
  {
    keyword: 'maxItems',
    dataPath: '.tags',
    instancePath: '/tags',
    schemaPath: '#/properties/tags/maxItems',
    params: {
      limit: 5,
    },
    message: 'should NOT have more than 5 items',
  },
  {
    keyword: 'uniqueItems',
    dataPath: '.tags',
    instancePath: '/tags',
    schemaPath: '#/properties/tags/uniqueItems',
    params: {},
    message: 'should NOT have duplicate items',
  },
] satisfies JsonSchemaError[];
