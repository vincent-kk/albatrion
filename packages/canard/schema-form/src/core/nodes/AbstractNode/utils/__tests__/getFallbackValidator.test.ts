import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getFallbackValidator } from '../getFallbackValidator';

describe('getFallbackValidator', () => {
  it('should return a function that returns error array', () => {
    const error = new Error('Compilation failed');
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'string',
      minLength: 5,
    };

    const validator = getFallbackValidator(error, jsonSchema);

    expect(typeof validator).toBe('function');

    const result = validator();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('should include correct error structure', () => {
    const error = new Error('Schema validation error');
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const validator = getFallbackValidator(error, jsonSchema);
    const errors = validator();

    expect(errors[0]).toHaveProperty('keyword', 'jsonSchemaCompileFailed');
    expect(errors[0]).toHaveProperty('dataPath', '/');
    expect(errors[0]).toHaveProperty('message', 'Schema validation error');
    expect(errors[0]).toHaveProperty('source', error);
    expect(errors[0]).toHaveProperty('details');
    expect(errors[0].details).toHaveProperty('jsonSchema', jsonSchema);
  });

  it('should preserve original error message', () => {
    const errorMessage = 'Invalid schema format: missing required field';
    const error = new Error(errorMessage);
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'array',
      items: { type: 'number' },
    };

    const validator = getFallbackValidator(error, jsonSchema);
    const errors = validator();

    expect(errors[0].message).toBe(errorMessage);
  });

  it('should include the original error as source', () => {
    const originalError = new Error('Original error');
    originalError.stack = 'Stack trace here';
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'boolean',
    };

    const validator = getFallbackValidator(originalError, jsonSchema);
    const errors = validator();

    expect(errors[0].source).toBe(originalError);
    expect(errors[0].source.stack).toBe('Stack trace here');
  });

  it('should handle complex schemas', () => {
    const error = new Error('Complex schema compilation failed');
    const complexSchema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            age: { type: 'number', minimum: 0 },
            email: { type: 'string', format: 'email' },
          },
          required: ['name', 'email'],
        },
        settings: {
          type: 'object',
          properties: {
            notifications: { type: 'boolean' },
            theme: { type: 'string', enum: ['light', 'dark'] },
          },
        },
      },
      required: ['user'],
    };

    const validator = getFallbackValidator(error, complexSchema);
    const errors = validator();

    expect(errors[0].details.jsonSchema).toEqual(complexSchema);
  });

  it('should handle schemas with computed properties', () => {
    const error = new Error('Computed schema error');
    const schemaWithComputed: JsonSchemaWithVirtual = {
      type: 'string',
    };

    const validator = getFallbackValidator(error, schemaWithComputed);
    const errors = validator();

    expect(errors[0].details.jsonSchema).toEqual(schemaWithComputed);
  });

  it('should handle virtual type schemas', () => {
    const error = new Error('Virtual type error');
    const virtualSchema: JsonSchemaWithVirtual = {
      type: 'virtual',
      default: ['computed', 'value'],
    };

    const validator = getFallbackValidator(error, virtualSchema);
    const errors = validator();

    expect(errors[0].details.jsonSchema.type).toBe('virtual');
  });

  it('should always return the same error structure for multiple calls', () => {
    const error = new Error('Consistent error');
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    };

    const validator = getFallbackValidator(error, jsonSchema);

    const result1 = validator();
    const result2 = validator();
    const result3 = validator();

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it('should handle errors with custom properties', () => {
    const error: any = new Error('Custom error');
    error.code = 'SCHEMA_COMPILE_ERROR';
    error.details = { line: 42, column: 10 };

    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    };

    const validator = getFallbackValidator(error, jsonSchema);
    const errors = validator();

    expect(errors[0].source).toBe(error);
    expect((errors[0].source as any).code).toBe('SCHEMA_COMPILE_ERROR');
    expect((errors[0].source as any).details).toEqual({ line: 42, column: 10 });
  });

  it('should handle undefined error message gracefully', () => {
    const error = new Error();
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'null',
    };

    const validator = getFallbackValidator(error, jsonSchema);
    const errors = validator();

    expect(errors[0].message).toBe('');
  });
});
