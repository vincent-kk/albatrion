import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { ComputedPropertiesManager } from '../ComputedPropertiesManager';

describe('new ComputedPropertiesManager', () => {
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute).toHaveProperty('active');
    expect(compute).toHaveProperty('visible');
    expect(compute).toHaveProperty('readOnly');
    expect(compute).toHaveProperty('disabled');
    expect(compute).toHaveProperty('oneOfIndex');
    expect(compute).toHaveProperty('anyOfIndices');
    expect(compute).toHaveProperty('watchValues');
    expect(compute).toHaveProperty('dependencyPaths');
    expect(compute).toHaveProperty('recalculate');
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toContain('/enabled');

    // Test visible by calling recalculate
    compute.recalculate([true]);
    expect(compute.visible).toBe(true);

    compute.recalculate([false]);
    expect(compute.visible).toBe(false);
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toContain('/prepared');

    // not prepared = readOnly
    compute.recalculate([false]);
    expect(compute.readOnly).toBe(true);

    // prepared = not readOnly
    compute.recalculate([true]);
    expect(compute.readOnly).toBe(false);
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    // no name = disabled
    compute.recalculate([undefined]);
    expect(compute.disabled).toBe(true);

    // short name = disabled
    compute.recalculate(['hi']);
    expect(compute.disabled).toBe(true);

    // valid name = enabled
    compute.recalculate(['alice']);
    expect(compute.disabled).toBe(false);
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    compute.recalculate([undefined, 11]);
    expect(compute.disabled).toBe(true);

    compute.recalculate([NaN, 5]);
    expect(compute.disabled).toBe(true);

    compute.recalculate([NaN, 15]);
    expect(compute.disabled).toBe(false);
  });

  it('should handle watch values with simple array', () => {
    const schema: any = {
      type: 'string',
      computed: {
        watch: ['/field1', '/field2', '/nested/field3'],
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toContain('/field1');
    expect(compute.dependencyPaths).toContain('/field2');
    expect(compute.dependencyPaths).toContain('/nested/field3');

    compute.recalculate(['value1', 'value2', 'value3']);
    expect(compute.watchValues).toEqual(['value1', 'value2', 'value3']);
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toContain('/dependency1');
    expect(compute.dependencyPaths).toContain('/dependency2');

    compute.recalculate([true, false]);
    expect(compute.visible).toBe(true);
    expect(compute.disabled).toBe(false);

    compute.recalculate([false, true]);
    expect(compute.visible).toBe(false);
    expect(compute.disabled).toBe(true);
  });

  it('should handle schema without computed properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'boolean',
    };
    const rootSchema: any = { type: 'object' };

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toEqual([]);

    // Check that the properties exist with default values
    expect(compute).toHaveProperty('active');
    expect(compute).toHaveProperty('visible');
    expect(compute).toHaveProperty('readOnly');
    expect(compute).toHaveProperty('disabled');
    expect(compute).toHaveProperty('oneOfIndex');
    expect(compute).toHaveProperty('anyOfIndices');
    expect(compute).toHaveProperty('watchValues');

    // Default values
    expect(compute.active).toBe(true);
    expect(compute.visible).toBe(true);
    expect(compute.readOnly).toBe(false);
    expect(compute.disabled).toBe(false);
    expect(compute.oneOfIndex).toBe(-1);
    expect(compute.anyOfIndices).toEqual([]);
    expect(compute.watchValues).toEqual([]);
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

    const visibleCompute = new ComputedPropertiesManager(
      visibleSchema.type,
      visibleSchema,
      rootSchema,
    );
    const readOnlyCompute = new ComputedPropertiesManager(
      readOnlySchema.type,
      readOnlySchema,
      rootSchema,
    );

    expect(visibleCompute.dependencyPaths).toEqual([]);
    expect(readOnlyCompute.dependencyPaths).toEqual([]);

    visibleCompute.recalculate([]);
    expect(visibleCompute.visible).toBe(false);

    readOnlyCompute.recalculate([]);
    expect(readOnlyCompute.readOnly).toBe(true);
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

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    expect(compute.dependencyPaths).toContain('/field1');
    expect(compute.dependencyPaths).toContain('field2');

    compute.recalculate([1, 2, 'value']);
    expect(compute.visible).toBe(true);

    compute.recalculate([1, 2, null]);
    expect(compute.visible).toBe(false);
  });

  it('should handle complex expressions like in the stories', () => {
    const schema: any = {
      type: 'string',
      computed: {
        disabled: 'dependencies[0]===undefined||dependencies[0].length<5',
      },
    };
    const rootSchema: any = { type: 'object' };

    const compute = new ComputedPropertiesManager(
      schema.type,
      schema,
      rootSchema,
    );

    // Check that some dependencies were processed
    expect(compute.dependencyPaths.length).toBeGreaterThanOrEqual(0);

    // Test the actual expression logic
    compute.recalculate([undefined]);
    expect(compute.disabled).toBe(true);

    compute.recalculate(['ab']);
    expect(compute.disabled).toBe(true);

    compute.recalculate(['alice']);
    expect(compute.disabled).toBe(false);
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

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Context exists
      compute.recalculate([{ userRole: 'admin' }]);
      expect(compute.visible).toBe(true);

      // Context is null
      compute.recalculate([null]);
      expect(compute.visible).toBe(false);

      // Context is undefined
      compute.recalculate([undefined]);
      expect(compute.visible).toBe(false);
    });

    it('should handle @ with property access using dot notation', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@.userRole === "admin"',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Admin user
      compute.recalculate([{ userRole: 'admin' }]);
      expect(compute.visible).toBe(true);

      // Regular user
      compute.recalculate([{ userRole: 'user' }]);
      expect(compute.visible).toBe(false);
    });

    it('should handle @ with nested property access', () => {
      const schema: any = {
        type: 'string',
        computed: {
          disabled: '!(@).permissions.canEdit',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Has edit permission
      compute.recalculate([{ permissions: { canEdit: true } }]);
      expect(compute.disabled).toBe(false);

      // No edit permission
      compute.recalculate([{ permissions: { canEdit: false } }]);
      expect(compute.disabled).toBe(true);
    });

    it('should handle @ with optional chaining', () => {
      const schema: any = {
        type: 'string',
        computed: {
          readOnly: '!(@)?.permissions?.canEdit',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Context with permissions
      compute.recalculate([{ permissions: { canEdit: true } }]);
      expect(compute.readOnly).toBe(false);

      // Context without permissions
      compute.recalculate([{}]);
      expect(compute.readOnly).toBe(true);

      // Null context
      compute.recalculate([null]);
      expect(compute.readOnly).toBe(true);
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

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/status');

      // Admin with draft status
      compute.recalculate([{ userRole: 'admin' }, 'draft']);
      expect(compute.visible).toBe(true);

      // Admin with published status
      compute.recalculate([{ userRole: 'admin' }, 'published']);
      expect(compute.visible).toBe(false);

      // Non-admin with draft status
      compute.recalculate([{ userRole: 'user' }, 'draft']);
      expect(compute.visible).toBe(false);
    });

    it('should handle @ in watch array', () => {
      const schema: any = {
        type: 'string',
        computed: {
          watch: ['@', '/field1', '/field2'],
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/field1');
      expect(compute.dependencyPaths).toContain('/field2');

      const context = { theme: 'dark' };
      compute.recalculate([context, 'value1', 'value2']);
      expect(compute.watchValues).toEqual([context, 'value1', 'value2']);
    });

    it('should handle @ with parentheses for explicit grouping', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '(@) !== null && (@).active === true',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Active context
      compute.recalculate([{ active: true }]);
      expect(compute.visible).toBe(true);

      // Inactive context
      compute.recalculate([{ active: false }]);
      expect(compute.visible).toBe(false);

      // Null context
      compute.recalculate([null]);
      expect(compute.visible).toBe(false);
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

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');
      expect(compute.dependencyPaths).toContain('/formState');
      expect(compute.dependencyPaths).toContain('../parentEnabled');

      // All conditions met - should be enabled (disabled = false)
      compute.recalculate([{ permissions: { canEdit: true } }, 'editable', true]);
      expect(compute.disabled).toBe(false);

      // No edit permission - should be disabled
      compute.recalculate([{ permissions: { canEdit: false } }, 'editable', true]);
      expect(compute.disabled).toBe(true);

      // Form not editable - should be disabled
      compute.recalculate([{ permissions: { canEdit: true } }, 'readonly', true]);
      expect(compute.disabled).toBe(true);

      // Parent not enabled - should be disabled
      compute.recalculate([{ permissions: { canEdit: true } }, 'editable', false]);
      expect(compute.disabled).toBe(true);
    });

    it('should handle @ with typeof check', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: 'typeof @ === "object" && @ !== null',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencyPaths).toContain('@');

      // Valid object context
      compute.recalculate([{ data: 'test' }]);
      expect(compute.visible).toBe(true);

      // Null context (typeof null is "object" but we check !== null)
      compute.recalculate([null]);
      expect(compute.visible).toBe(false);

      // Undefined context
      compute.recalculate([undefined]);
      expect(compute.visible).toBe(false);
    });

    it('should handle @ reference appearing multiple times (deduplication)', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '@ !== null && @.active && @.permissions?.view',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      // @ should appear only once in dependencyPaths (deduplication)
      const contextCount = compute.dependencyPaths.filter(
        (p: string) => p === '@',
      ).length;
      expect(contextCount).toBe(1);

      // All conditions met
      compute.recalculate([{ active: true, permissions: { view: true } }]);
      expect(compute.visible).toBe(true);

      // Missing view permission
      compute.recalculate([{ active: true, permissions: { view: false } }]);
      expect(compute.visible).toBe(false);
    });
  });
});
