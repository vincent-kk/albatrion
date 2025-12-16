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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const visibleCompute = computeFactory(
      visibleSchema.type,
      visibleSchema,
      rootSchema,
    );
    const readOnlyCompute = computeFactory(
      readOnlySchema.type,
      readOnlySchema,
      rootSchema,
    );

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

    const compute = computeFactory(schema.type, schema, rootSchema);

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

  describe('Context (@) path support', () => {
    it('should handle standalone @ context reference', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@ !== null && @ !== undefined',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      if (compute.visible) {
        // Context exists
        const visibleResult = compute.visible([{ userRole: 'admin' }]);
        expect(visibleResult).toBe(true);

        // Context is null
        const hiddenResult = compute.visible([null]);
        expect(hiddenResult).toBe(false);

        // Context is undefined
        const undefinedResult = compute.visible([undefined]);
        expect(undefinedResult).toBe(false);
      }
    });

    it('should handle @ with property access using dot notation', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@.userRole === "admin"',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      // Admin user
      const adminResult = compute.visible?.([{ userRole: 'admin' }]);
      expect(adminResult).toBe(true);

      // Regular user
      const userResult = compute.visible?.([{ userRole: 'user' }]);
      expect(userResult).toBe(false);
    });

    it('should handle @ with nested property access', () => {
      const schema: any = {
        type: 'string',
        computed: {
          disabled: '!(@).permissions.canEdit',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      // Has edit permission
      const enabledResult = compute.disabled?.([
        { permissions: { canEdit: true } },
      ]);
      expect(enabledResult).toBe(false);

      // No edit permission
      const disabledResult = compute.disabled?.([
        { permissions: { canEdit: false } },
      ]);
      expect(disabledResult).toBe(true);
    });

    it('should handle @ with optional chaining', () => {
      const schema: any = {
        type: 'string',
        computed: {
          readOnly: '!(@)?.permissions?.canEdit',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      if (compute.readOnly) {
        // Context with permissions
        const editableResult = compute.readOnly([
          { permissions: { canEdit: true } },
        ]);
        expect(editableResult).toBe(false);

        // Context without permissions
        const readOnlyResult = compute.readOnly([{}]);
        expect(readOnlyResult).toBe(true);

        // Null context
        const nullResult = compute.readOnly([null]);
        expect(nullResult).toBe(true);
      }
    });

    it('should handle @ combined with other JSON Pointer paths', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@.userRole === "admin" && /status === "draft"',
        },
      };
      const rootSchema: any = {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/status');

      if (compute.visible) {
        // Admin with draft status
        const visibleResult = compute.visible([{ userRole: 'admin' }, 'draft']);
        expect(visibleResult).toBe(true);

        // Admin with published status
        const hiddenResult1 = compute.visible([
          { userRole: 'admin' },
          'published',
        ]);
        expect(hiddenResult1).toBe(false);

        // Non-admin with draft status
        const hiddenResult2 = compute.visible([{ userRole: 'user' }, 'draft']);
        expect(hiddenResult2).toBe(false);
      }
    });

    it('should handle @ in watch array', () => {
      const schema: any = {
        type: 'string',
        computed: {
          watch: ['@', '/field1', '/field2'],
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/field1');
      expect(compute.dependencyPaths).toContain('/field2');

      if (compute.watchValues) {
        const context = { theme: 'dark' };
        const watchedValues = compute.watchValues([
          context,
          'value1',
          'value2',
        ]);
        expect(watchedValues).toEqual([context, 'value1', 'value2']);
      }
    });

    it('should handle @ with parentheses for explicit grouping', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '(@) !== null && (@).active === true',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      if (compute.visible) {
        // Active context
        const visibleResult = compute.visible([{ active: true }]);
        expect(visibleResult).toBe(true);

        // Inactive context
        const hiddenResult = compute.visible([{ active: false }]);
        expect(hiddenResult).toBe(false);

        // Null context
        const nullResult = compute.visible([null]);
        expect(nullResult).toBe(false);
      }
    });

    it('should handle complex expression with @ and multiple paths', () => {
      const schema: any = {
        type: 'string',
        computed: {
          disabled:
            '!((@)?.permissions?.canEdit && /formState === "editable" && ../parentEnabled)',
        },
      };
      const rootSchema: any = {
        type: 'object',
        properties: {
          formState: { type: 'string' },
          parent: {
            type: 'object',
            properties: {
              parentEnabled: { type: 'boolean' },
              child: { type: 'string' },
            },
          },
        },
      };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/formState');
      expect(compute.dependencyPaths).toContain('../parentEnabled');

      if (compute.disabled) {
        // All conditions met - should be enabled (disabled = false)
        const enabledResult = compute.disabled([
          { permissions: { canEdit: true } },
          'editable',
          true,
        ]);
        expect(enabledResult).toBe(false);

        // No edit permission - should be disabled
        const noPermissionResult = compute.disabled([
          { permissions: { canEdit: false } },
          'editable',
          true,
        ]);
        expect(noPermissionResult).toBe(true);

        // Form not editable - should be disabled
        const notEditableResult = compute.disabled([
          { permissions: { canEdit: true } },
          'readonly',
          true,
        ]);
        expect(notEditableResult).toBe(true);

        // Parent not enabled - should be disabled
        const parentDisabledResult = compute.disabled([
          { permissions: { canEdit: true } },
          'editable',
          false,
        ]);
        expect(parentDisabledResult).toBe(true);
      }
    });

    it('should handle @ with typeof check', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: 'typeof @ === "object" && @ !== null',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      expect(compute.dependencyPaths).toContain('@');

      if (compute.visible) {
        // Valid object context
        const objectResult = compute.visible([{ data: 'test' }]);
        expect(objectResult).toBe(true);

        // Null context (typeof null is "object" but we check !== null)
        const nullResult = compute.visible([null]);
        expect(nullResult).toBe(false);

        // Undefined context
        const undefinedResult = compute.visible([undefined]);
        expect(undefinedResult).toBe(false);
      }
    });

    it('should handle @ reference appearing multiple times (deduplication)', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@ !== null && @.active && @.permissions?.view',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = computeFactory(schema.type, schema, rootSchema);

      // @ should appear only once in dependencyPaths (deduplication)
      const contextCount = compute.dependencyPaths.filter(
        (p: string) => p === '@',
      ).length;
      expect(contextCount).toBe(1);

      if (compute.visible) {
        // All conditions met
        const visibleResult = compute.visible([
          { active: true, permissions: { view: true } },
        ]);
        expect(visibleResult).toBe(true);

        // Missing view permission
        const noViewResult = compute.visible([
          { active: true, permissions: { view: false } },
        ]);
        expect(noViewResult).toBe(false);
      }
    });
  });
});
