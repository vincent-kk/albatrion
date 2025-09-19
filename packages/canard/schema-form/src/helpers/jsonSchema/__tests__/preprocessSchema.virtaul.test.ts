import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { preprocessSchema } from '../preprocessSchema/preprocessSchema';

describe('JsonSchemaScanner - Virtual Schema Test', () => {
  it('should handle multiple mutations on same schema', () => {
    const originalSchema = {
      type: 'object',
      properties: {
        control: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          default: 'A',
        },
        alwaysVisible: {
          type: 'string',
        },
        virtualFiled_A1: {
          type: 'string',
          format: 'date',
          default: '2025-01-01',
        },
        virtualFiled_A2: {
          type: 'string',
          format: 'date',
        },
        virtualField_B1: {
          type: 'string',
          format: 'week',
          default: '2025-W28',
        },
        virtualField_B2: {
          type: 'string',
          format: 'week',
        },
      },
      virtual: {
        virtualField_A: {
          fields: ['virtualFiled_A1', 'virtualFiled_A2'],
        },
        virtualField_B: {
          fields: ['virtualField_B1', 'virtualField_B2'],
        },
      },
      if: {
        properties: {
          control: {
            enum: ['A'],
          },
        },
      },
      then: {
        required: ['virtualField_A'],
      },
      else: {
        if: {
          properties: {
            control: {
              enum: ['B'],
            },
          },
        },
        then: {
          required: ['virtualField_B'],
        },
      },
    } as JsonSchema;

    const trueResult = {
      type: 'object',
      properties: {
        control: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          default: 'A',
        },
        alwaysVisible: {
          type: 'string',
        },
        virtualFiled_A1: {
          type: 'string',
          format: 'date',
          default: '2025-01-01',
        },
        virtualFiled_A2: {
          type: 'string',
          format: 'date',
        },
        virtualField_B1: {
          type: 'string',
          format: 'week',
          default: '2025-W28',
        },
        virtualField_B2: {
          type: 'string',
          format: 'week',
        },
      },
      virtual: {
        virtualField_A: {
          fields: ['virtualFiled_A1', 'virtualFiled_A2'],
        },
        virtualField_B: {
          fields: ['virtualField_B1', 'virtualField_B2'],
        },
      },
      if: {
        properties: {
          control: {
            enum: ['A'],
          },
        },
      },
      then: {
        required: ['virtualFiled_A1', 'virtualFiled_A2'],
        virtualRequired: ['virtualField_A'],
      },
      else: {
        if: {
          properties: {
            control: {
              enum: ['B'],
            },
          },
        },
        then: {
          required: ['virtualField_B1', 'virtualField_B2'],
          virtualRequired: ['virtualField_B'],
        },
      },
    } as JsonSchema;

    const result = preprocessSchema(originalSchema);

    expect(result).toEqual(trueResult);
  });

  it('should handle normal schema', () => {
    const originalSchema = {
      type: 'object',
      properties: {
        control: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          default: 'A',
        },
        alwaysVisible: {
          type: 'string',
        },
        virtualFiled_A1: {
          type: 'string',
          format: 'date',
          default: '2025-01-01',
        },
        virtualFiled_A2: {
          type: 'string',
          format: 'date',
        },
        virtualField_B1: {
          type: 'string',
          format: 'week',
          default: '2025-W28',
        },
        virtualField_B2: {
          type: 'string',
          format: 'week',
        },
      },
      virtual: {
        virtualField_A: {
          fields: ['virtualFiled_A1', 'virtualFiled_A2'],
        },
        virtualField_B: {
          fields: ['virtualField_B1', 'virtualField_B2'],
        },
      },
      required: ['control', 'virtualField_A'],
    } as JsonSchema;

    const trueResult = {
      type: 'object',
      properties: {
        control: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          default: 'A',
        },
        alwaysVisible: {
          type: 'string',
        },
        virtualFiled_A1: {
          type: 'string',
          format: 'date',
          default: '2025-01-01',
        },
        virtualFiled_A2: {
          type: 'string',
          format: 'date',
        },
        virtualField_B1: {
          type: 'string',
          format: 'week',
          default: '2025-W28',
        },
        virtualField_B2: {
          type: 'string',
          format: 'week',
        },
      },
      virtual: {
        virtualField_A: {
          fields: ['virtualFiled_A1', 'virtualFiled_A2'],
        },
        virtualField_B: {
          fields: ['virtualField_B1', 'virtualField_B2'],
        },
      },
      required: ['control', 'virtualFiled_A1', 'virtualFiled_A2'],
      virtualRequired: ['virtualField_A'],
    } as JsonSchema;

    const result = preprocessSchema(originalSchema);

    expect(result).toEqual(trueResult);
  });

  it('should handle deeply nested if-then-else structures', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['dev', 'staging', 'prod'] },
        feature: { type: 'string', enum: ['basic', 'advanced', 'premium'] },
        field1: { type: 'string' },
        field2: { type: 'string' },
        field3: { type: 'string' },
        field4: { type: 'string' },
        field5: { type: 'string' },
      },
      virtual: {
        devGroup: { fields: ['field1', 'field2'] },
        stagingGroup: { fields: ['field3'] },
        prodGroup: { fields: ['field4', 'field5'] },
      },
      if: {
        properties: { mode: { const: 'dev' } },
      },
      then: {
        if: {
          properties: { feature: { const: 'basic' } },
        },
        then: {
          required: ['devGroup'],
        },
        else: {
          required: ['devGroup', 'field3'],
        },
      },
      else: {
        if: {
          properties: { mode: { const: 'staging' } },
        },
        then: {
          required: ['stagingGroup'],
        },
        else: {
          if: {
            properties: { feature: { const: 'premium' } },
          },
          then: {
            required: ['prodGroup'],
          },
          else: {
            required: ['field1'],
          },
        },
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    expect(result.then.then.required).toEqual(['field1', 'field2']);
    expect(result.then.then.virtualRequired).toEqual(['devGroup']);
    expect(result.then.else.required).toEqual(['field1', 'field2', 'field3']);
    expect(result.then.else.virtualRequired).toEqual(['devGroup']);
    expect(result.else.then.required).toEqual(['field3']);
    expect(result.else.then.virtualRequired).toEqual(['stagingGroup']);
    expect(result.else.else.then.required).toEqual(['field4', 'field5']);
    expect(result.else.else.then.virtualRequired).toEqual(['prodGroup']);
    expect(result.else.else.else.required).toEqual(['field1']);
    expect(result.else.else.else.virtualRequired).toBeUndefined();
  });

  it('should handle mixed virtual and non-virtual fields in required', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        address1: { type: 'string' },
        address2: { type: 'string' },
      },
      virtual: {
        contactInfo: { fields: ['email', 'phone'] },
        addressInfo: { fields: ['address1', 'address2'] },
      },
      if: {
        properties: { name: { minLength: 1 } },
      },
      then: {
        required: ['name', 'contactInfo', 'addressInfo'],
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    expect(result.then.required).toEqual([
      'name',
      'email',
      'phone',
      'address1',
      'address2',
    ]);
    expect(result.then.virtualRequired).toEqual(['contactInfo', 'addressInfo']);
  });

  it('should handle schemas without virtual property', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      if: {
        properties: { name: { minLength: 1 } },
      },
      then: {
        required: ['name', 'age'],
      },
    };

    const result = preprocessSchema(originalSchema);

    // virtual property가 없으므로 변환되지 않아야 함
    expect(result).toEqual(originalSchema);
  });

  it('should handle schemas without if property', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
      },
      virtual: {
        group1: { fields: ['field1', 'field2'] },
      },
      required: ['field1', 'field2'],
      virtualRequired: ['group1'],
    };

    const result = preprocessSchema(originalSchema);

    // if property가 없으므로 변환되지 않아야 함
    expect(result).toEqual(originalSchema);
  });

  it('should handle empty virtual fields array', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        field1: { type: 'string' },
      },
      virtual: {
        emptyGroup: { fields: [] },
      },
      if: {
        properties: { field1: { minLength: 1 } },
      },
      then: {
        required: ['emptyGroup', 'field1'],
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    expect(result.then.required).toEqual(['field1']);
    expect(result.then.virtualRequired).toEqual(['emptyGroup']);
  });

  it('should handle non-existent virtual keys in required', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        field1: { type: 'string' },
        field2: { type: 'string' },
      },
      virtual: {
        existingGroup: { fields: ['field1'] },
      },
      if: {
        properties: { field1: { minLength: 1 } },
      },
      then: {
        required: ['nonExistentGroup', 'field2', 'existingGroup'],
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    // nonExistentGroup은 virtual에 없으므로 그대로 유지, existingGroup은 변환
    expect(result.then.required).toEqual([
      'nonExistentGroup',
      'field2',
      'field1',
    ]);
    expect(result.then.virtualRequired).toEqual(['existingGroup']);
  });

  it('should handle schemas without required arrays', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        field1: { type: 'string' },
      },
      virtual: {
        group1: { fields: ['field1'] },
      },
      if: {
        properties: { field1: { minLength: 1 } },
      },
      then: {
        // required 배열이 없음
        additionalProperties: false,
      },
      else: {
        required: ['group1'],
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    // then에는 required가 없으므로 변경되지 않음
    expect(result.then).toEqual({ additionalProperties: false });
    // else에는 required가 있으므로 변환됨
    expect(result.else.required).toEqual(['field1']);
    expect(result.else.virtualRequired).toEqual(['group1']);
  });

  it('should handle complex nested structures with multiple virtual transformations', () => {
    const originalSchema: JsonSchema = {
      type: 'object',
      properties: {
        userType: { type: 'string', enum: ['admin', 'user'] },
        permission: { type: 'string', enum: ['read', 'write'] },
        name: { type: 'string' },
        email: { type: 'string' },
        adminField1: { type: 'string' },
        adminField2: { type: 'string' },
        userField1: { type: 'string' },
        userField2: { type: 'string' },
      },
      virtual: {
        basicInfo: { fields: ['name', 'email'] },
        adminInfo: { fields: ['adminField1', 'adminField2'] },
        userInfo: { fields: ['userField1', 'userField2'] },
      },
      if: {
        properties: { userType: { const: 'admin' } },
      },
      then: {
        if: {
          properties: { permission: { const: 'write' } },
        },
        then: {
          required: ['basicInfo', 'adminInfo'],
        },
        else: {
          required: ['basicInfo'],
        },
      },
      else: {
        if: {
          properties: { permission: { const: 'write' } },
        },
        then: {
          required: ['basicInfo', 'userInfo'],
        },
        else: {
          required: ['basicInfo'],
        },
      },
    };

    const result = preprocessSchema(originalSchema) as any;

    // admin + write
    expect(result.then.then.required).toEqual([
      'name',
      'email',
      'adminField1',
      'adminField2',
    ]);
    expect(result.then.then.virtualRequired).toEqual([
      'basicInfo',
      'adminInfo',
    ]);

    // admin + read
    expect(result.then.else.required).toEqual(['name', 'email']);
    expect(result.then.else.virtualRequired).toEqual(['basicInfo']);

    // user + write
    expect(result.else.then.required).toEqual([
      'name',
      'email',
      'userField1',
      'userField2',
    ]);
    expect(result.else.then.virtualRequired).toEqual(['basicInfo', 'userInfo']);

    // user + read
    expect(result.else.else.required).toEqual(['name', 'email']);
    expect(result.else.else.virtualRequired).toEqual(['basicInfo']);
  });
});
