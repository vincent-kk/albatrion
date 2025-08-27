import { describe, expect, it, vi } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getNodeGroup } from '../getNodeGroup';

// Mock isReactComponent
vi.mock('@winglet/react-utils/filter', () => ({
  isReactComponent: vi.fn((value) => {
    return (
      typeof value === 'function' ||
      (value && typeof value === 'object' && value.$$typeof)
    );
  }),
}));

describe('getNodeGroup', () => {
  it('should return virtual for virtual type schema', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'virtual',
      default: ['computed', 'value'],
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should return terminal when terminal property is true', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      terminal: true,
      properties: {},
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should return branch when terminal property is false', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'array',
      terminal: false,
      items: { type: 'string' },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should return terminal for array with FormTypeInput component', () => {
    const MockComponent = () => null;
    const schema: JsonSchemaWithVirtual = {
      type: 'array',
      FormTypeInput: MockComponent,
      items: { type: 'number' },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should return terminal for object with FormTypeInput component', () => {
    const MockComponent = () => null;
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      FormTypeInput: MockComponent,
      properties: {
        name: { type: 'string' },
      },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should return branch for array without FormTypeInput', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'array',
      items: { type: 'string' },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should return branch for object without FormTypeInput', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {
        field: { type: 'boolean' },
      },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should return branch for primitive types', () => {
    const stringSchema: JsonSchemaWithVirtual = { type: 'string' };
    const numberSchema: JsonSchemaWithVirtual = { type: 'number' };
    const booleanSchema: JsonSchemaWithVirtual = { type: 'boolean' };
    const integerSchema: JsonSchemaWithVirtual = { type: 'integer' };
    const nullSchema: JsonSchemaWithVirtual = { type: 'null' };

    expect(getNodeGroup(stringSchema)).toBe('terminal');
    expect(getNodeGroup(numberSchema)).toBe('terminal');
    expect(getNodeGroup(booleanSchema)).toBe('terminal');
    expect(getNodeGroup(integerSchema)).toBe('terminal');
    expect(getNodeGroup(nullSchema)).toBe('terminal');
  });

  it('should handle React component class as FormTypeInput', () => {
    class ComponentClass {
      $$typeof = Symbol.for('react.element');
      render() {
        return null;
      }
    }

    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      FormTypeInput: ComponentClass as any,
      properties: {},
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should return branch when FormTypeInput is not a valid component', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      FormTypeInput: 'not-a-component' as any,
      properties: {},
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should prioritize terminal property over FormTypeInput check', () => {
    const MockComponent = () => null;
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      terminal: false,
      FormTypeInput: MockComponent,
      properties: {},
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should handle schema with both terminal true and FormTypeInput', () => {
    const MockComponent = () => null;
    const schema: JsonSchemaWithVirtual = {
      type: 'array',
      terminal: true,
      FormTypeInput: MockComponent,
      items: { type: 'string' },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should handle complex nested schema', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {
        nested: {
          type: 'object',
          properties: {
            deep: { type: 'string' },
          },
        },
      },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('branch');
  });

  it('should handle schema with oneOf', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      oneOf: [{ const: 'option1' }, { const: 'option2' }],
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });

  it('should handle schema with computed properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      computed: {
        visible: '',
      },
    };

    const result = getNodeGroup(schema);
    expect(result).toBe('terminal');
  });
});
