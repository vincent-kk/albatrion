import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { getIfConditionsMap } from '../getOneOfConditionsMap/getIfConditionsMap';

describe('getIfConditionsMap', () => {
  it('should return null if schema has no if or then condition', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = getIfConditionsMap(schema);
    expect(result).toBeNull();
  });

  it('should correctly parse simple if-then condition with string value', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['person', 'company'] },
        name: { type: 'string' },
        taxId: { type: 'string' },
      },
      if: {
        properties: {
          type: { const: 'company' },
        },
      },
      then: {
        required: ['taxId'],
      },
    };

    const result = getIfConditionsMap(schema);

    expect(result).toBeInstanceOf(Map);
    expect(result?.size).toBe(1);
    expect(result?.get('taxId')).toEqual(['@.type==="company"']);
  });

  it('should correctly parse if-then-else conditions with array values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['USA', 'Canada', 'Mexico'] },
        state: { type: 'string' },
        province: { type: 'string' },
      },
      if: {
        properties: {
          country: { enum: ['USA', 'Mexico'] },
        },
      },
      then: {
        required: ['state'],
      },
      else: {
        if: {
          properties: {
            country: { const: 'Canada' },
          },
        },
        then: {
          required: ['province'],
        },
      },
    };

    const result = getIfConditionsMap(schema);

    expect(result).toBeInstanceOf(Map);
    expect(result?.size).toBe(2);
    expect(result?.get('state')).toEqual([
      '["USA","Mexico"].includes(@.country)',
    ]);
    expect(result?.get('province')).toEqual(['@.country==="Canada"']);
  });

  it('should handle inverse conditions correctly', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        isEmployed: { type: 'string', enum: ['yes', 'no'] },
        companyName: { type: 'string' },
        reasonUnemployed: { type: 'string' },
      },
      if: {
        properties: {
          isEmployed: { const: 'yes' },
        },
      },
      then: {
        required: ['companyName'],
      },
      else: {
        required: ['reasonUnemployed'],
      },
    };

    const result = getIfConditionsMap(schema);

    expect(result).toBeInstanceOf(Map);
    expect(result?.size).toBe(2);
    expect(result?.get('companyName')).toEqual(['@.isEmployed==="yes"']);
    expect(result?.get('reasonUnemployed')).toEqual(['@.isEmployed!=="yes"']);
  });

  it('should combine multiple conditions for the same field', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        userType: { type: 'string', enum: ['admin', 'user', 'guest'] },
        status: { type: 'string', enum: ['active', 'inactive'] },
        adminPanel: { type: 'boolean' },
      },
      if: {
        properties: {
          userType: { const: 'admin' },
        },
      },
      then: {
        required: ['adminPanel'],
      },
      else: {
        if: {
          properties: {
            userType: { const: 'user' },
            status: { const: 'active' },
          },
        },
        then: {
          required: ['adminPanel'],
        },
      },
    };

    const result = getIfConditionsMap(schema);

    expect(result).toBeInstanceOf(Map);
    expect(result?.size).toBe(1);
    const adminPanelConditions = result?.get('adminPanel');
    expect(adminPanelConditions).toContain('@.userType==="admin"');
    expect(adminPanelConditions).toContain('@.userType==="user"');
    expect(adminPanelConditions).toContain('@.status==="active"');
  });
});
