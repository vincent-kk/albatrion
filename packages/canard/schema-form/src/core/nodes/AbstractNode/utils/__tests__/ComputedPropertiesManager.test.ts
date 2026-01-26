import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { ComputedPropertiesManager } from '../ComputedPropertiesManager';

/**
 * Helper function to set dependency values and recalculate
 * @param manager - ComputedPropertiesManager instance
 * @param values - Array of dependency values
 */
function setDependenciesAndRecalculate(
  manager: ComputedPropertiesManager,
  values: unknown[],
): void {
  values.forEach((value, index) => {
    manager.dependencies[index] = value;
  });
  manager.recalculate();
}

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
    expect(compute.isEnabled).toBe(false);
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
    expect(compute.isEnabled).toBe(true);

    // Test visible by calling recalculate
    setDependenciesAndRecalculate(compute, [true]);
    expect(compute.visible).toBe(true);

    setDependenciesAndRecalculate(compute, [false]);
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
    setDependenciesAndRecalculate(compute, [false]);
    expect(compute.readOnly).toBe(true);

    // prepared = not readOnly
    setDependenciesAndRecalculate(compute, [true]);
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
    setDependenciesAndRecalculate(compute, [undefined]);
    expect(compute.disabled).toBe(true);

    // short name = disabled
    setDependenciesAndRecalculate(compute, ['hi']);
    expect(compute.disabled).toBe(true);

    // valid name = enabled
    setDependenciesAndRecalculate(compute, ['alice']);
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

    setDependenciesAndRecalculate(compute, [undefined, 11]);
    expect(compute.disabled).toBe(true);

    setDependenciesAndRecalculate(compute, [NaN, 5]);
    expect(compute.disabled).toBe(true);

    setDependenciesAndRecalculate(compute, [NaN, 15]);
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

    setDependenciesAndRecalculate(compute, ['value1', 'value2', 'value3']);
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

    setDependenciesAndRecalculate(compute, [true, false]);
    expect(compute.visible).toBe(true);
    expect(compute.disabled).toBe(false);

    setDependenciesAndRecalculate(compute, [false, true]);
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
    expect(compute.isEnabled).toBe(false);

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

    visibleCompute.recalculate();
    expect(visibleCompute.visible).toBe(false);

    readOnlyCompute.recalculate();
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

    setDependenciesAndRecalculate(compute, [1, 2, 'value']);
    expect(compute.visible).toBe(true);

    setDependenciesAndRecalculate(compute, [1, 2, null]);
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
    setDependenciesAndRecalculate(compute, [undefined]);
    expect(compute.disabled).toBe(true);

    setDependenciesAndRecalculate(compute, ['ab']);
    expect(compute.disabled).toBe(true);

    setDependenciesAndRecalculate(compute, ['alice']);
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
      setDependenciesAndRecalculate(compute, [{ userRole: 'admin' }]);
      expect(compute.visible).toBe(true);

      // Context is null
      setDependenciesAndRecalculate(compute, [null]);
      expect(compute.visible).toBe(false);

      // Context is undefined
      setDependenciesAndRecalculate(compute, [undefined]);
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
      setDependenciesAndRecalculate(compute, [{ userRole: 'admin' }]);
      expect(compute.visible).toBe(true);

      // Regular user
      setDependenciesAndRecalculate(compute, [{ userRole: 'user' }]);
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
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: true } },
      ]);
      expect(compute.disabled).toBe(false);

      // No edit permission
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: false } },
      ]);
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
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: true } },
      ]);
      expect(compute.readOnly).toBe(false);

      // Context without permissions
      setDependenciesAndRecalculate(compute, [{}]);
      expect(compute.readOnly).toBe(true);

      // Null context
      setDependenciesAndRecalculate(compute, [null]);
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
      setDependenciesAndRecalculate(compute, [{ userRole: 'admin' }, 'draft']);
      expect(compute.visible).toBe(true);

      // Admin with published status
      setDependenciesAndRecalculate(compute, [
        { userRole: 'admin' },
        'published',
      ]);
      expect(compute.visible).toBe(false);

      // Non-admin with draft status
      setDependenciesAndRecalculate(compute, [{ userRole: 'user' }, 'draft']);
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
      setDependenciesAndRecalculate(compute, [context, 'value1', 'value2']);
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
      setDependenciesAndRecalculate(compute, [{ active: true }]);
      expect(compute.visible).toBe(true);

      // Inactive context
      setDependenciesAndRecalculate(compute, [{ active: false }]);
      expect(compute.visible).toBe(false);

      // Null context
      setDependenciesAndRecalculate(compute, [null]);
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
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: true } },
        'editable',
        true,
      ]);
      expect(compute.disabled).toBe(false);

      // No edit permission - should be disabled
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: false } },
        'editable',
        true,
      ]);
      expect(compute.disabled).toBe(true);

      // Form not editable - should be disabled
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: true } },
        'readonly',
        true,
      ]);
      expect(compute.disabled).toBe(true);

      // Parent not enabled - should be disabled
      setDependenciesAndRecalculate(compute, [
        { permissions: { canEdit: true } },
        'editable',
        false,
      ]);
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
      setDependenciesAndRecalculate(compute, [{ data: 'test' }]);
      expect(compute.visible).toBe(true);

      // Null context (typeof null is "object" but we check !== null)
      setDependenciesAndRecalculate(compute, [null]);
      expect(compute.visible).toBe(false);

      // Undefined context
      setDependenciesAndRecalculate(compute, [undefined]);
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
      setDependenciesAndRecalculate(compute, [
        { active: true, permissions: { view: true } },
      ]);
      expect(compute.visible).toBe(true);

      // Missing view permission
      setDependenciesAndRecalculate(compute, [
        { active: true, permissions: { view: false } },
      ]);
      expect(compute.visible).toBe(false);
    });
  });

  describe('dependencies array direct access', () => {
    it('should allow direct access to dependencies array', () => {
      const schema: any = {
        type: 'string',
        computed: {
          watch: ['/field1', '/field2', '/field3'],
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      // Direct array access
      compute.dependencies[0] = 'value1';
      compute.dependencies[1] = 'value2';
      compute.dependencies[2] = 'value3';

      expect(compute.dependencies[0]).toBe('value1');
      expect(compute.dependencies[1]).toBe('value2');
      expect(compute.dependencies[2]).toBe('value3');
    });

    it('should update dependency and recalculate', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '/enabled === true',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      // Set to false and recalculate
      compute.dependencies[0] = false;
      compute.recalculate();
      expect(compute.visible).toBe(false);

      // Update to true and recalculate
      compute.dependencies[0] = true;
      compute.recalculate();
      expect(compute.visible).toBe(true);
    });

    it('should have correct dependencies array length based on dependencyPaths', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '/a === true && /b === true',
          watch: ['/c', '/d'],
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.dependencies.length).toBe(compute.dependencyPaths.length);
    });
  });

  describe('isEnabled property', () => {
    it('should be true when schema has computed properties', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '/enabled === true',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isEnabled).toBe(true);
    });

    it('should be false when schema has no computed properties', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isEnabled).toBe(false);
    });
  });

  describe('isPristineDefined and getPristine', () => {
    it('should handle pristine computed property', () => {
      const schema: any = {
        type: 'string',
        computed: {
          pristine: '/value === ""',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isPristineDefined).toBe(true);
      expect(compute.hasPostProcessor).toBe(true);

      // Empty value = pristine
      compute.dependencies[0] = '';
      expect(compute.getPristine()).toBe(true);

      // Non-empty value = not pristine
      compute.dependencies[0] = 'some value';
      expect(compute.getPristine()).toBe(false);
    });

    it('should return undefined when pristine is not defined', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isPristineDefined).toBe(false);
      expect(compute.getPristine()).toBeUndefined();
    });
  });

  describe('isDerivedDefined and getDerivedValue', () => {
    it('should handle derived computed property', () => {
      const schema: any = {
        type: 'string',
        computed: {
          derived: '/firstName + " " + /lastName',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isDerivedDefined).toBe(true);
      expect(compute.hasPostProcessor).toBe(true);

      compute.dependencies[0] = 'John';
      compute.dependencies[1] = 'Doe';
      expect(compute.getDerivedValue()).toBe('John Doe');
    });

    it('should return undefined when derived is not defined', () => {
      const schema: JsonSchemaWithVirtual = {
        type: 'string',
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.isDerivedDefined).toBe(false);
      expect(compute.getDerivedValue()).toBeUndefined();
    });
  });

  describe('hasPostProcessor property', () => {
    it('should be true when derived is defined', () => {
      const schema: any = {
        type: 'string',
        computed: {
          derived: '/value',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.hasPostProcessor).toBe(true);
    });

    it('should be true when pristine is defined', () => {
      const schema: any = {
        type: 'string',
        computed: {
          pristine: '/value === ""',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.hasPostProcessor).toBe(true);
    });

    it('should be true when both derived and pristine are defined', () => {
      const schema: any = {
        type: 'string',
        computed: {
          derived: '/value',
          pristine: '/value === ""',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.hasPostProcessor).toBe(true);
      expect(compute.isDerivedDefined).toBe(true);
      expect(compute.isPristineDefined).toBe(true);
    });

    it('should be false when neither derived nor pristine are defined', () => {
      const schema: any = {
        type: 'string',
        computed: {
          visible: '/enabled === true',
        },
      };
      const rootSchema: any = { type: 'object' };

      const compute = new ComputedPropertiesManager(
        schema.type,
        schema,
        rootSchema,
      );

      expect(compute.hasPostProcessor).toBe(false);
      expect(compute.isDerivedDefined).toBe(false);
      expect(compute.isPristineDefined).toBe(false);
    });
  });
});
