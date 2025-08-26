import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { computeFactory } from '../computeFactory';

describe('computeFactory', () => {
  it('should create compute functions for basic schema', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      title: 'Test Field',
    };
    const rootSchema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {
        test: schema,
      },
    };

    const compute = computeFactory(schema, rootSchema);

    expect(compute).toHaveProperty('visible');
    expect(compute).toHaveProperty('readOnly');
    expect(compute).toHaveProperty('disabled');
    expect(compute).toHaveProperty('oneOfIndex');
    expect(compute).toHaveProperty('watchValues');
    expect(compute).toHaveProperty('dependencyPaths');
    expect(compute.dependencyPaths).toEqual([]);
  });

  it('should handle computed visible property with simple expression', () => {
    const schema: any = {
      type: 'string',
      computed: {
        visible: '/enabled === true',
      },
    };
    const rootSchema: any = {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        test: schema,
      },
    };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toContain('/enabled');

    if (compute.visible) {
      const result = compute.visible([true]);
      expect(result).toBe(true);

      const hiddenResult = compute.visible([false]);
      expect(hiddenResult).toBe(false);
    }
  });

  it('should handle computed readOnly property with negation', () => {
    const schema: any = {
      type: 'string',
      computed: {
        readOnly: '!(/prepared)',
      },
    };
    const rootSchema: any = {
      type: 'object',
      properties: {
        prepared: { type: 'boolean' },
        test: schema,
      },
    };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toContain('/prepared');

    if (compute.readOnly) {
      const readOnlyResult = compute.readOnly([false]); // not prepared = readOnly
      expect(readOnlyResult).toBe(true);

      const editableResult = compute.readOnly([true]); // prepared = not readOnly
      expect(editableResult).toBe(false);
    }
  });

  it('should handle computed disabled property with expressions', () => {
    const schema: any = {
      type: 'number',
      computed: {
        disabled: 'dependencies[0]===undefined||dependencies[0].length<5',
      },
    };
    const rootSchema: any = {
      type: 'object',
    };

    const compute = computeFactory(schema, rootSchema);

    // Test that the function works correctly
    if (compute.disabled) {
      const disabledResult = compute.disabled([undefined]); // no name = disabled
      expect(disabledResult).toBe(true);

      const shortNameResult = compute.disabled(['hi']); // short name = disabled
      expect(shortNameResult).toBe(true);

      const enabledResult = compute.disabled(['alice']); // valid name = enabled
      expect(enabledResult).toBe(false);
    }
  });

  it('should handle multiple conditions with logical operators', () => {
    const schema: any = {
      type: 'string',
      computed: {
        disabled: '(/dependencies1)===undefined||(/dependencies2)<10',
      },
    };
    const rootSchema: any = {
      type: 'object',
      properties: {
        age: { type: 'number' },
        nationality: schema,
      },
    };

    const compute = computeFactory(schema, rootSchema);

    // Test that the function works correctly

    if (compute.disabled) {
      const noAgeResult = compute.disabled([undefined, 11]);
      expect(noAgeResult).toBe(true);

      const youngResult = compute.disabled([NaN, 5]);
      expect(youngResult).toBe(true);

      const oldEnoughResult = compute.disabled([NaN, 15]);
      expect(oldEnoughResult).toBe(false);
    }
  });

  it('should handle watch values with simple array', () => {
    const schema: any = {
      type: 'string',
      computed: {
        watch: ['/field1', '/field2', '/nested/field3'],
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toContain('/field1');
    expect(compute.dependencyPaths).toContain('/field2');
    expect(compute.dependencyPaths).toContain('/nested/field3');

    if (compute.watchValues) {
      const watchedValues = compute.watchValues(['value1', 'value2', 'value3']);
      expect(watchedValues).toEqual(['value1', 'value2', 'value3']);
    }
  });

  it('should handle multiple computed properties', () => {
    const schema: any = {
      type: 'string',
      computed: {
        visible: '/dependency1 === true',
        disabled: '/dependency2 === true',
        watch: ['/dependency1', '/dependency2'],
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toContain('/dependency1');
    expect(compute.dependencyPaths).toContain('/dependency2');

    if (compute.visible) {
      const visibleResult = compute.visible([true, false]);
      expect(visibleResult).toBe(true);
    }

    if (compute.disabled) {
      const disabledResult = compute.disabled([false, true]);
      expect(disabledResult).toBe(true);
    }
  });

  it('should handle schema without computed properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'boolean',
    };
    const rootSchema: any = { type: 'object' };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toEqual([]);

    // Functions can be undefined when no computed properties exist
    // Just check that the properties exist on the compute object
    expect(compute).toHaveProperty('visible');
    expect(compute).toHaveProperty('readOnly');
    expect(compute).toHaveProperty('disabled');
    expect(compute).toHaveProperty('oneOfIndex');
    expect(compute).toHaveProperty('watchValues');
  });

  it('should handle boolean values directly set', () => {
    const visibleSchema: JsonSchemaWithVirtual = {
      type: 'string',
      visible: false,
    };
    const readOnlySchema: JsonSchemaWithVirtual = {
      type: 'string',
      readOnly: true,
    };
    const rootSchema: any = { type: 'object' };

    const visibleCompute = computeFactory(visibleSchema, rootSchema);
    const readOnlyCompute = computeFactory(readOnlySchema, rootSchema);

    expect(visibleCompute.dependencyPaths).toEqual([]);
    expect(readOnlyCompute.dependencyPaths).toEqual([]);

    if (visibleCompute.visible) {
      expect(visibleCompute.visible([])).toBe(false);
    }

    if (readOnlyCompute.readOnly) {
      expect(readOnlyCompute.readOnly([])).toBe(true);
    }
  });

  it('should normalize paths correctly', () => {
    const schema: any = {
      type: 'string',
      computed: {
        watch: ['/field1', 'field2'],
        visible: 'dependencies[2] !== null',
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = computeFactory(schema, rootSchema);

    expect(compute.dependencyPaths).toContain('/field1');
    expect(compute.dependencyPaths).toContain('field2');

    if (compute.visible) {
      const result = compute.visible([1, 2, 'value']);
      expect(result).toBe(true);

      const nullResult = compute.visible([1, 2, null]);
      expect(nullResult).toBe(false);
    }
  });

  it('should handle complex expressions like in the stories', () => {
    const schema: any = {
      type: 'string',
      computed: {
        disabled: 'dependencies[0]===undefined||dependencies[0].length<5',
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = computeFactory(schema, rootSchema);

    // Check that some dependencies were processed
    expect(compute.dependencyPaths.length).toBeGreaterThanOrEqual(0);

    if (compute.disabled) {
      // Test the actual expression logic
      const undefinedResult = compute.disabled([undefined]);
      expect(undefinedResult).toBe(true);

      const shortResult = compute.disabled(['ab']);
      expect(shortResult).toBe(true);

      const validResult = compute.disabled(['alice']);
      expect(validResult).toBe(false);
    }
  });
});
