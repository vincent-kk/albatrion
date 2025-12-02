import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { processVirtualSchema } from '../processVirtualSchema';

describe('processVirtualSchema', () => {
  describe('when virtual property is undefined', () => {
    it('should return null', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const result = processVirtualSchema(schema);
      expect(result).toBeNull();
    });
  });

  describe('when virtual property exists', () => {
    describe('with required fields', () => {
      it('should transform virtual fields in required array', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
          },
          required: ['fullName'],
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['firstName', 'lastName']);
        expect(result?.virtualRequired).toEqual(['fullName']);
      });

      it('should handle multiple virtual fields', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            fullAddress: { type: 'string' },
            locationInfo: { type: 'string' },
          },
          required: ['fullAddress', 'locationInfo'],
          virtual: {
            fullAddress: {
              fields: ['street', 'city'],
            },
            locationInfo: {
              fields: ['city', 'state'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['street', 'city', 'state']);
        expect(result?.virtualRequired).toEqual([
          'fullAddress',
          'locationInfo',
        ]);
      });

      it('should handle mixed virtual and non-virtual required fields', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
          },
          required: ['id', 'fullName'],
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['id', 'firstName', 'lastName']);
        expect(result?.virtualRequired).toEqual(['fullName']);
      });

      it('should avoid duplicate required fields', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            userInfo: { type: 'string' },
            contactInfo: { type: 'string' },
          },
          required: ['userInfo', 'contactInfo', 'name'],
          virtual: {
            userInfo: {
              fields: ['name', 'email'],
            },
            contactInfo: {
              fields: ['email'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['name', 'email']);
        expect(result?.virtualRequired).toEqual(['userInfo', 'contactInfo']);
      });
    });

    describe('with conditional schemas (then/else)', () => {
      it('should transform virtual fields in then clause', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            hasAddress: { type: 'boolean' },
            street: { type: 'string' },
            city: { type: 'string' },
            fullAddress: { type: 'string' },
          },
          virtual: {
            fullAddress: {
              fields: ['street', 'city'],
            },
          },
          if: {
            properties: {
              hasAddress: { const: true },
            },
          },
          then: {
            required: ['fullAddress'],
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.then).toBeDefined();
        expect(result?.then?.required).toEqual(['street', 'city']);
        expect(result?.then?.virtualRequired).toEqual(['fullAddress']);
      });

      it('should transform virtual fields in else clause', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            hasContact: { type: 'boolean' },
            email: { type: 'string' },
            phone: { type: 'string' },
            contactInfo: { type: 'string' },
          },
          virtual: {
            contactInfo: {
              fields: ['email', 'phone'],
            },
          },
          if: {
            properties: {
              hasContact: { const: false },
            },
          },
          else: {
            required: ['contactInfo'],
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.else).toBeDefined();
        expect(result?.else?.required).toEqual(['email', 'phone']);
        expect(result?.else?.virtualRequired).toEqual(['contactInfo']);
      });

      it('should transform nested then/else with virtual fields', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            type: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            company: { type: 'string' },
            department: { type: 'string' },
            workInfo: { type: 'string' },
          },
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
            workInfo: {
              fields: ['company', 'department'],
            },
          },
          if: {
            properties: {
              type: { const: 'personal' },
            },
          },
          then: {
            required: ['fullName'],
            then: {
              required: ['fullName'],
            },
          },
          else: {
            required: ['workInfo'],
            else: {
              required: ['workInfo'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();

        expect(result?.then?.required).toEqual(['firstName', 'lastName']);
        expect(result?.then?.virtualRequired).toEqual(['fullName']);
        expect(result?.then?.then?.required).toEqual(['firstName', 'lastName']);
        expect(result?.then?.then?.virtualRequired).toEqual(['fullName']);

        expect(result?.else?.required).toEqual(['company', 'department']);
        expect(result?.else?.virtualRequired).toEqual(['workInfo']);
        expect(result?.else?.else?.required).toEqual(['company', 'department']);
        expect(result?.else?.else?.virtualRequired).toEqual(['workInfo']);
      });

      it('should handle both then and else clauses together', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            isPerson: { type: 'boolean' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            companyName: { type: 'string' },
            companyId: { type: 'string' },
            companyInfo: { type: 'string' },
          },
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
            companyInfo: {
              fields: ['companyName', 'companyId'],
            },
          },
          if: {
            properties: {
              isPerson: { const: true },
            },
          },
          then: {
            required: ['fullName'],
          },
          else: {
            required: ['companyInfo'],
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();

        expect(result?.then?.required).toEqual(['firstName', 'lastName']);
        expect(result?.then?.virtualRequired).toEqual(['fullName']);

        expect(result?.else?.required).toEqual(['companyName', 'companyId']);
        expect(result?.else?.virtualRequired).toEqual(['companyInfo']);
      });
    });

    describe('with all conditions (required, then, else)', () => {
      it('should transform all virtual fields appropriately', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            contactInfo: { type: 'string' },
            street: { type: 'string' },
            city: { type: 'string' },
            address: { type: 'string' },
          },
          required: ['fullName'],
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
            contactInfo: {
              fields: ['email', 'phone'],
            },
            address: {
              fields: ['street', 'city'],
            },
          },
          if: {
            properties: {
              type: { const: 'detailed' },
            },
          },
          then: {
            required: ['contactInfo'],
          },
          else: {
            required: ['address'],
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();

        expect(result?.required).toEqual(['firstName', 'lastName']);
        expect(result?.virtualRequired).toEqual(['fullName']);

        expect(result?.then?.required).toEqual(['email', 'phone']);
        expect(result?.then?.virtualRequired).toEqual(['contactInfo']);

        expect(result?.else?.required).toEqual(['street', 'city']);
        expect(result?.else?.virtualRequired).toEqual(['address']);
      });
    });

    describe('edge cases', () => {
      it('should handle empty virtual fields array', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            virtualField: { type: 'string' },
          },
          required: ['virtualField'],
          virtual: {
            virtualField: {
              fields: [],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual([]);
        expect(result?.virtualRequired).toEqual(['virtualField']);
      });

      it('should handle virtual property without matching required field', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
          },
          required: ['firstName'],
          virtual: {
            fullName: {
              fields: ['firstName', 'lastName'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['firstName']);
        expect(result?.virtualRequired).toBeUndefined();
      });

      it('should return null when virtual exists but no conditions are met', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            field: { type: 'string' },
          },
          virtual: {
            virtualField: {
              fields: ['field'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).toBeNull();
      });

      it('should handle schema without properties', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          required: ['virtualField'],
          virtual: {
            virtualField: {
              fields: ['field1', 'field2'],
            },
          },
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.required).toEqual(['field1', 'field2']);
        expect(result?.virtualRequired).toEqual(['virtualField']);
      });

      it('should preserve original schema properties', () => {
        const schema: Partial<JsonSchema> = {
          type: 'object',
          title: 'Test Schema',
          description: 'A test schema',
          properties: {
            field1: { type: 'string' },
            field2: { type: 'string' },
            virtualField: { type: 'string' },
          },
          required: ['virtualField'],
          virtual: {
            virtualField: {
              fields: ['field1', 'field2'],
            },
          },
          additionalProperties: false,
        };

        const result = processVirtualSchema(schema);
        expect(result).not.toBeNull();
        expect(result?.type).toBe('object');
        expect(result?.title).toBe('Test Schema');
        expect(result?.description).toBe('A test schema');
        expect(result?.properties).toEqual(schema.properties);
        expect(result?.additionalProperties).toBe(false);
      });
    });
  });
});
