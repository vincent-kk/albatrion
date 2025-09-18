import { describe, expect, it } from 'vitest';

import { ENHANCED_KEY } from '@/schema-form/app/constants/internal';
import type { JsonSchema } from '@/schema-form/types';

import { preprocessSchema } from '../preprocessSchema/preprocessSchema';

describe('JsonSchemaScanner - OneOf Schema Test', () => {
  it('should handle oneOf schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        { properties: { a: { type: 'string' } } },
        { properties: { b: { type: 'number' } } },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            a: { type: 'string' },
          },
        },
        {
          properties: {
            [ENHANCED_KEY]: { const: 1 },
            b: { type: 'number' },
          },
        },
      ],
    });
  });

  it('should handle nested oneOf schemas', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        field: {
          type: 'object',
          oneOf: [
            { properties: { option1: { type: 'string' } } },
            { properties: { option2: { type: 'boolean' } } },
          ],
        },
      },
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'object',
          oneOf: [
            {
              properties: {
                [ENHANCED_KEY]: { const: 0 },
                option1: { type: 'string' },
              },
            },
            {
              properties: {
                [ENHANCED_KEY]: { const: 1 },
                option2: { type: 'boolean' },
              },
            },
          ],
        },
      },
    });
  });

  it('should handle oneOf with existing properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { const: 'email' },
            email: { type: 'string', format: 'email' },
          },
        },
        {
          properties: {
            type: { const: 'phone' },
            phone: { type: 'string', pattern: '^[0-9-]+$' },
          },
        },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            type: { const: 'email' },
            email: { type: 'string', format: 'email' },
          },
        },
        {
          properties: {
            [ENHANCED_KEY]: { const: 1 },
            type: { const: 'phone' },
            phone: { type: 'string', pattern: '^[0-9-]+$' },
          },
        },
      ],
    });
  });

  it('should handle oneOf with virtual required fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['userInfo'],
          virtual: {
            userInfo: { fields: ['name', 'email'] },
          },
        },
        {
          type: 'object',
          properties: {
            company: { type: 'string' },
            taxId: { type: 'string' },
          },
          required: ['companyInfo'],
          virtual: {
            companyInfo: { fields: ['company', 'taxId'] },
          },
        },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['name', 'email'],
          virtualRequired: ['userInfo'],
          virtual: {
            userInfo: { fields: ['name', 'email'] },
          },
        },
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 1 },
            company: { type: 'string' },
            taxId: { type: 'string' },
          },
          required: ['company', 'taxId'],
          virtualRequired: ['companyInfo'],
          virtual: {
            companyInfo: { fields: ['company', 'taxId'] },
          },
        },
      ],
    });
  });

  it('should handle complex oneOf with nested conditions and virtual required', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            type: { type: 'string' as const, const: 'individual' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['personalInfo'],
          virtual: {
            personalInfo: { fields: ['firstName', 'lastName'] },
          },
          if: {
            properties: { age: { minimum: 18 } },
          },
          then: {
            properties: {
              ssn: { type: 'string' },
            },
            required: ['legalInfo'],
            virtual: {
              legalInfo: { fields: ['ssn'] },
            },
          },
        },
        {
          type: 'object',
          properties: {
            type: { type: 'string' as const, const: 'business' },
            companyName: { type: 'string' },
            registrationNumber: { type: 'string' },
          },
          required: ['businessInfo'],
          virtual: {
            businessInfo: { fields: ['companyName', 'registrationNumber'] },
          },
        },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            type: { type: 'string', const: 'individual' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['firstName', 'lastName'],
          virtualRequired: ['personalInfo'],
          virtual: {
            personalInfo: { fields: ['firstName', 'lastName'] },
          },
          if: {
            properties: { age: { minimum: 18 } },
          },
          then: {
            properties: {
              ssn: { type: 'string' },
            },
            required: ['legalInfo'],
            virtual: {
              legalInfo: { fields: ['ssn'] },
            },
          },
        },
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 1 },
            type: { type: 'string', const: 'business' },
            companyName: { type: 'string' },
            registrationNumber: { type: 'string' },
          },
          required: ['companyName', 'registrationNumber'],
          virtualRequired: ['businessInfo'],
          virtual: {
            businessInfo: { fields: ['companyName', 'registrationNumber'] },
          },
        },
      ],
    });
  });

  it('should handle oneOf with multiple levels of nesting', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        payment: {
          type: 'object',
          oneOf: [
            {
              properties: {
                method: { const: 'card' },
                card: {
                  type: 'object',
                  oneOf: [
                    {
                      properties: {
                        type: { const: 'credit' },
                        creditLimit: { type: 'number' },
                      },
                    },
                    {
                      properties: {
                        type: { const: 'debit' },
                        balance: { type: 'number' },
                      },
                    },
                  ],
                },
              },
            },
            {
              properties: {
                method: { const: 'bank' },
                accountNumber: { type: 'string' },
              },
            },
          ],
        },
      },
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      properties: {
        payment: {
          type: 'object',
          oneOf: [
            {
              properties: {
                [ENHANCED_KEY]: { const: 0 },
                method: { const: 'card' },
                card: {
                  type: 'object',
                  oneOf: [
                    {
                      properties: {
                        type: { const: 'credit' },
                        creditLimit: { type: 'number' },
                      },
                    },
                    {
                      properties: {
                        type: { const: 'debit' },
                        balance: { type: 'number' },
                      },
                    },
                  ],
                },
              },
            },
            {
              properties: {
                [ENHANCED_KEY]: { const: 1 },
                method: { const: 'bank' },
                accountNumber: { type: 'string' },
              },
            },
          ],
        },
      },
    });
  });

  it('should handle oneOf with mixed virtual required and regular required', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
          required: ['id', 'contactInfo'],
          virtual: {
            contactInfo: { fields: ['email', 'phone'] },
          },
        },
        {
          type: 'object',
          properties: {
            code: { type: 'string' },
            anonymous: { type: 'boolean' as const, const: true },
          },
          required: ['code', 'anonymous'],
        },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
          required: ['id', 'email', 'phone'],
          virtualRequired: ['contactInfo'],
          virtual: {
            contactInfo: { fields: ['email', 'phone'] },
          },
        },
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 1 },
            code: { type: 'string' },
            anonymous: { type: 'boolean', const: true },
          },
          required: ['code', 'anonymous'],
        },
      ],
    });
  });

  it('should handle oneOf with conditional virtual required in else clause', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            hasAccount: { type: 'boolean' },
            username: { type: 'string' },
            password: { type: 'string' },
            guestName: { type: 'string' },
            guestEmail: { type: 'string' },
          },
          if: {
            properties: { hasAccount: { const: true } },
          },
          then: {
            required: ['credentials'],
            virtual: {
              credentials: { fields: ['username', 'password'] },
            },
          },
          else: {
            required: ['guestInfo'],
            virtual: {
              guestInfo: { fields: ['guestName', 'guestEmail'] },
            },
          },
        },
      ],
    };

    const result = preprocessSchema(schema);

    expect(result).toEqual({
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            [ENHANCED_KEY]: { const: 0 },
            hasAccount: { type: 'boolean' },
            username: { type: 'string' },
            password: { type: 'string' },
            guestName: { type: 'string' },
            guestEmail: { type: 'string' },
          },
          if: {
            properties: { hasAccount: { const: true } },
          },
          then: {
            required: ['credentials'],
            virtual: {
              credentials: { fields: ['username', 'password'] },
            },
          },
          else: {
            required: ['guestInfo'],
            virtual: {
              guestInfo: { fields: ['guestName', 'guestEmail'] },
            },
          },
        },
      ],
    });
  });
});
