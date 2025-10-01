import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/**
 * Deep nested oneOf test suite
 *
 * Test focus:
 * 1. 3-level deep oneOf nesting (root → level1 → level2 → level3)
 * 2. Value restoration behavior in isolation vs non-isolation mode
 * 3. AlternatedNode logic: same-type field vs different-type field
 * 4. InitialValue vs nextValue priority in different scenarios
 * 5. Complex switching patterns with value preservation
 */
describe('ConditionalSchema - Deep Nested OneOf with Reset Logic', () => {
  describe('3-level deep oneOf nesting', () => {
    const createDeepNestedSchema = (): JsonSchema => ({
      type: 'object',
      properties: {
        level1Type: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./level1Type === 'A'",
          properties: {
            level2: {
              type: 'object',
              properties: {
                level2Type: {
                  type: 'string',
                  enum: ['A1', 'A2'],
                  default: 'A1',
                },
              },
              oneOf: [
                {
                  '&if': "./level2Type === 'A1'",
                  properties: {
                    level3: {
                      type: 'object',
                      properties: {
                        level3Type: {
                          type: 'string',
                          enum: ['A1-X', 'A1-Y'],
                          default: 'A1-X',
                        },
                      },
                      oneOf: [
                        {
                          '&if': "./level3Type === 'A1-X'",
                          properties: {
                            deepValue: { type: 'string', default: 'default-x' },
                            sharedField: { type: 'number', default: 100 },
                          },
                        },
                        {
                          '&if': "./level3Type === 'A1-Y'",
                          properties: {
                            deepValue: { type: 'string', default: 'default-y' },
                            sharedField: { type: 'number', default: 200 },
                            yOnlyField: { type: 'string' },
                          },
                        },
                      ],
                    },
                  },
                },
                {
                  '&if': "./level2Type === 'A2'",
                  properties: {
                    level3: {
                      type: 'object',
                      properties: {
                        level3Type: {
                          type: 'string',
                          enum: ['A2-X', 'A2-Y'],
                          default: 'A2-X',
                        },
                      },
                      oneOf: [
                        {
                          '&if': "./level3Type === 'A2-X'",
                          properties: {
                            deepValue: {
                              type: 'string',
                              default: 'default-a2x',
                            },
                            sharedField: { type: 'number', default: 300 },
                          },
                        },
                        {
                          '&if': "./level3Type === 'A2-Y'",
                          properties: {
                            deepValue: {
                              type: 'string',
                              default: 'default-a2y',
                            },
                            sharedField: { type: 'number', default: 400 },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          '&if': "./level1Type === 'B'",
          properties: {
            level2: {
              type: 'object',
              properties: {
                differentField: { type: 'string' },
              },
            },
          },
        },
      ],
    });

    it('should handle deep value restoration through 3 levels of oneOf', async () => {
      const schema = createDeepNestedSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set deep nested value
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-X',
            deepValue: 'custom-x',
            sharedField: 999,
          },
        },
      });

      await delay();

      expect(node.value).toEqual({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-X',
            deepValue: 'custom-x',
            sharedField: 999,
          },
        },
      });

      // Switch within level3: A1-X → A1-Y
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-Y',
            deepValue: 'custom-y',
            sharedField: 888,
            yOnlyField: 'y-field',
          },
        },
      });

      await delay();

      expect(node.value).toEqual({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-Y',
            deepValue: 'custom-y',
            sharedField: 888,
            yOnlyField: 'y-field',
          },
        },
      });

      // Switch back to A1-X - sharedField should be restored
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-X',
            deepValue: 'new-x',
            sharedField: 777,
          },
        },
      });

      await delay();

      expect(node.value).toEqual({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-X',
            deepValue: 'new-x',
            sharedField: 777,
          },
        },
      });
    });

    it('should handle cross-level2 switching (A1 → A2)', async () => {
      const schema = createDeepNestedSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set value in A1 branch
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-Y',
            deepValue: 'a1-y-value',
            sharedField: 555,
            yOnlyField: 'y-only',
          },
        },
      });

      await delay();

      // Switch to A2 branch - level3 structure changes completely
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A2',
          level3: {
            level3Type: 'A2-X',
            deepValue: 'a2-x-value',
            sharedField: 666,
          },
        },
      });

      await delay();

      expect(node.value).toEqual({
        level1Type: 'A',
        level2: {
          level2Type: 'A2',
          level3: {
            level3Type: 'A2-X',
            deepValue: 'a2-x-value',
            sharedField: 666,
          },
        },
      });

      // yOnlyField should not exist in A2 branch
      const level3Node = node.find('./level2/level3') as ObjectNode;
      const yOnlyNode = level3Node.find('./yOnlyField');
      expect(yOnlyNode).toBeNull();
    });

    it('should handle top-level switch (A → B) and completely reset nested structure', async () => {
      const schema = createDeepNestedSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set deep value in A branch
      node.setValue({
        level1Type: 'A',
        level2: {
          level2Type: 'A1',
          level3: {
            level3Type: 'A1-X',
            deepValue: 'deep-value',
            sharedField: 123,
          },
        },
      });

      await delay();

      // Switch to B branch - completely different structure
      node.setValue({
        level1Type: 'B',
        level2: {
          differentField: 'b-field-value',
        },
      });

      await delay();

      expect(node.value).toEqual({
        level1Type: 'B',
        level2: {
          differentField: 'b-field-value',
        },
      });

      // level3 should not exist in B branch
      const level2Node = node.find('./level2') as ObjectNode;
      const level3Node = level2Node.find('./level3');
      expect(level3Node).toBeNull();
    });
  });

  describe('Reset logic: isolation mode vs non-isolation mode', () => {
    const createResetTestSchema = (): JsonSchema => ({
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          enum: ['variant1', 'variant2'],
          default: 'variant1',
        },
      },
      oneOf: [
        {
          '&if': "./variant === 'variant1'",
          properties: {
            // Same name, same type - should restore value
            sameTypeField: { type: 'string', default: 'default1' },
            // Same name, different type in variant2
            mixedTypeField: { type: 'string', default: 'string-default' },
            // Only in variant1
            variant1Only: { type: 'number', default: 10 },
          },
        },
        {
          '&if': "./variant === 'variant2'",
          properties: {
            // Same name, same type - should restore value
            sameTypeField: { type: 'string', default: 'default2' },
            // Same name, different type
            mixedTypeField: { type: 'number', default: 100 },
            // Only in variant2
            variant2Only: { type: 'boolean', default: false },
          },
        },
      ],
    });

    it('should restore same-type field value when switching back (isolation mode)', async () => {
      const schema = createResetTestSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set custom value in variant1
      node.setValue({
        variant: 'variant1',
        sameTypeField: 'custom-value-1',
        mixedTypeField: 'string-value',
        variant1Only: 999,
      });

      await delay();

      expect(node.value?.sameTypeField).toBe('custom-value-1');

      // Switch to variant2 - setValue uses isolation mode
      node.setValue({
        variant: 'variant2',
        sameTypeField: 'custom-value-2',
        mixedTypeField: 200,
        variant2Only: true,
      });

      await delay();

      expect(node.value?.sameTypeField).toBe('custom-value-2');
      expect(node.value?.mixedTypeField).toBe(200);

      // Switch back to variant1 - sameTypeField should be restored from setValue
      node.setValue({
        variant: 'variant1',
        sameTypeField: 'new-value-1',
        mixedTypeField: 'new-string',
        variant1Only: 777,
      });

      await delay();

      expect(node.value).toEqual({
        variant: 'variant1',
        sameTypeField: 'new-value-1',
        mixedTypeField: 'new-string',
        variant1Only: 777,
      });
    });

    it('should use initialValue when preferInitialValue=true (non-isolation, same-type alternated)', async () => {
      const schema = createResetTestSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set variant1 with custom value
      node.setValue({
        variant: 'variant1',
        sameTypeField: 'variant1-custom',
        mixedTypeField: 'string-custom',
      });

      await delay();

      // Switch to variant2 via child node (non-isolation mode)
      const variantNode = node.find('./variant') as StringNode;
      variantNode.setValue('variant2');

      await delay();

      // sameTypeField should reset to initialValue (default2) because:
      // - isolation = false (child node setValue)
      // - preferInitialValue = true
      // - alternatedNode exists with same type
      expect(node.value?.sameTypeField).toBe('default2');

      // mixedTypeField keeps its initialValue (100) in variant2
      // because child setValue doesn't filter out incompatible types
      expect(node.value?.mixedTypeField).toBe(100);
    });

    it('should not restore different-type field even with same name', async () => {
      const schema = createResetTestSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // variant1: mixedTypeField is string
      node.setValue({
        variant: 'variant1',
        mixedTypeField: 'string-value',
      });

      await delay();

      expect(node.value?.mixedTypeField).toBe('string-value');

      // variant2: mixedTypeField is number (different type)
      node.setValue({
        variant: 'variant2',
        mixedTypeField: 300,
      });

      await delay();

      expect(node.value?.mixedTypeField).toBe(300);

      // Switch back to variant1
      // mixedTypeField should use provided value (isolation mode)
      node.setValue({
        variant: 'variant1',
        mixedTypeField: 'new-string-value',
      });

      await delay();

      expect(node.value?.mixedTypeField).toBe('new-string-value');
    });

    it('should handle variant-specific fields correctly (created/destroyed on switch)', async () => {
      const schema = createResetTestSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // variant1: has variant1Only field
      node.setValue({
        variant: 'variant1',
        variant1Only: 888,
      });

      await delay();

      expect(node.value?.variant1Only).toBe(888);
      expect(node.value?.variant2Only).toBeUndefined();

      // Switch to variant2: variant1Only should disappear, variant2Only appears
      node.setValue({
        variant: 'variant2',
        variant2Only: true,
      });

      await delay();

      expect(node.value?.variant1Only).toBeUndefined();
      expect(node.value?.variant2Only).toBe(true);

      // Switch back: variant1Only reappears, variant2Only disappears
      node.setValue({
        variant: 'variant1',
        variant1Only: 555,
      });

      await delay();

      expect(node.value?.variant1Only).toBe(555);
      expect(node.value?.variant2Only).toBeUndefined();
    });
  });

  describe('AlternatedNode and type matching edge cases', () => {
    it('should handle null/undefined values in alternatedNode scenario', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['mode1', 'mode2'],
            default: 'mode1',
          },
        },
        oneOf: [
          {
            '&if': "./mode === 'mode1'",
            properties: {
              optionalField: { type: 'string' },
            },
          },
          {
            '&if': "./mode === 'mode2'",
            properties: {
              optionalField: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Don't set optionalField
      node.setValue({ mode: 'mode1' });
      await delay();

      expect(node.value?.optionalField).toBeUndefined();

      // Switch mode without setting optionalField
      node.setValue({ mode: 'mode2' });
      await delay();

      expect(node.value?.optionalField).toBeUndefined();

      // Now set optionalField
      node.setValue({ mode: 'mode2', optionalField: 'value2' });
      await delay();

      expect(node.value?.optionalField).toBe('value2');

      // Switch back - should use provided value (isolation mode)
      node.setValue({ mode: 'mode1', optionalField: 'value1' });
      await delay();

      expect(node.value?.optionalField).toBe('value1');
    });

    it('should handle complex object type in oneOf with nested properties', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          objectType: {
            type: 'string',
            enum: ['typeA', 'typeB'],
            default: 'typeA',
          },
        },
        oneOf: [
          {
            '&if': "./objectType === 'typeA'",
            properties: {
              nestedObject: {
                type: 'object',
                properties: {
                  field1: { type: 'string', default: 'a1' },
                  field2: { type: 'number', default: 100 },
                },
              },
            },
          },
          {
            '&if': "./objectType === 'typeB'",
            properties: {
              nestedObject: {
                type: 'object',
                properties: {
                  field1: { type: 'string', default: 'b1' },
                  field3: { type: 'boolean', default: false },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set typeA with custom nested values
      node.setValue({
        objectType: 'typeA',
        nestedObject: {
          field1: 'custom-a1',
          field2: 999,
        },
      });

      await delay();

      expect(node.value?.nestedObject).toEqual({
        field1: 'custom-a1',
        field2: 999,
      });

      // Switch to typeB - nestedObject has different structure
      node.setValue({
        objectType: 'typeB',
        nestedObject: {
          field1: 'custom-b1',
          field3: true,
        },
      });

      await delay();

      expect(node.value?.nestedObject).toEqual({
        field1: 'custom-b1',
        field3: true,
      });

      // field2 should not exist in typeB
      const nestedNode = node.find('./nestedObject') as ObjectNode;
      const field2Node = nestedNode.find('./field2');
      expect(field2Node).toBeNull();
    });

    it('should properly handle array type fields in oneOf variants', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          arrayMode: {
            type: 'string',
            enum: ['strings', 'numbers'],
            default: 'strings',
          },
        },
        oneOf: [
          {
            '&if': "./arrayMode === 'strings'",
            properties: {
              items: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
          {
            '&if': "./arrayMode === 'numbers'",
            properties: {
              items: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set string array
      node.setValue({
        arrayMode: 'strings',
        items: ['a', 'b', 'c'],
      });

      await delay();

      expect(node.value?.items).toEqual(['a', 'b', 'c']);

      // Switch to number array
      node.setValue({
        arrayMode: 'numbers',
        items: [1, 2, 3],
      });

      await delay();

      expect(node.value?.items).toEqual([1, 2, 3]);

      // Switch back to strings - should use provided array
      node.setValue({
        arrayMode: 'strings',
        items: ['x', 'y', 'z'],
      });

      await delay();

      expect(node.value?.items).toEqual(['x', 'y', 'z']);
    });
  });

  describe('Non-isolation mode edge cases', () => {
    it('should handle non-terminal type (Object) alternatedNode in non-isolation mode', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['v1', 'v2'],
            default: 'v1',
          },
        },
        oneOf: [
          {
            '&if': "./variant === 'v1'",
            properties: {
              // Same name, same type (object), different structure
              config: {
                type: 'object',
                properties: {
                  v1Setting: { type: 'string', default: 'v1-default' },
                },
              },
            },
          },
          {
            '&if': "./variant === 'v2'",
            properties: {
              // Same name, same type (object), different structure
              config: {
                type: 'object',
                properties: {
                  v2Setting: { type: 'number', default: 100 },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set v1 with custom config
      node.setValue({
        variant: 'v1',
        config: {
          v1Setting: 'custom-v1',
        },
      });

      await delay();

      expect(node.value?.config).toEqual({ v1Setting: 'custom-v1' });

      // Switch to v2 via child node (non-isolation)
      const variantNode = node.find('./variant') as StringNode;
      variantNode.setValue('v2');

      await delay();

      // config is Object type (non-terminal)
      // isTerminalType(node.type) = false
      // → preferLatestValue = isolation || false = false
      // → uses initialValue
      expect(node.value?.config).toEqual({ v2Setting: 100 });
    });

    it('should handle child node setValue on oneOf internal field', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['mode1', 'mode2'],
            default: 'mode1',
          },
        },
        oneOf: [
          {
            '&if': "./mode === 'mode1'",
            properties: {
              data: {
                type: 'object',
                properties: {
                  value: { type: 'string', default: 'default1' },
                },
              },
            },
          },
          {
            '&if': "./mode === 'mode2'",
            properties: {
              data: {
                type: 'object',
                properties: {
                  value: { type: 'string', default: 'default2' },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set mode1 with data
      node.setValue({
        mode: 'mode1',
        data: {
          value: 'mode1-value',
        },
      });

      await delay();

      // Change internal field directly via child node
      const valueNode = node.find('./data/value') as StringNode;
      valueNode.setValue('child-changed-value');

      await delay();

      // Internal field change should propagate
      expect(node.value?.data?.value).toBe('child-changed-value');

      // Now switch mode via parent setValue (isolation mode)
      node.setValue({
        mode: 'mode2',
        data: {
          value: 'mode2-value',
        },
      });

      await delay();

      expect(node.value?.data?.value).toBe('mode2-value');
    });

    it('should use initialValue for new field without alternatedNode in non-isolation mode', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['typeA', 'typeB'],
            default: 'typeA',
          },
        },
        oneOf: [
          {
            '&if': "./type === 'typeA'",
            properties: {
              onlyInA: { type: 'string' },
            },
          },
          {
            '&if': "./type === 'typeB'",
            properties: {
              onlyInB: { type: 'number', default: 999 },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set typeA
      node.setValue({
        type: 'typeA',
        onlyInA: 'a-value',
      });

      await delay();

      // Switch to typeB via child node (non-isolation)
      const typeNode = node.find('./type') as StringNode;
      typeNode.setValue('typeB');

      await delay();

      // onlyInB is new field (no alternatedNode)
      // alternatedNode = false
      // → preferLatestValue = isolation || false = false
      // → uses initialValue
      expect(node.value?.onlyInB).toBe(999);
      expect(node.value?.onlyInA).toBeUndefined();
    });

    it('should handle setValue with same variant condition (no oneOf switch)', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['cat1', 'cat2'],
            default: 'cat1',
          },
        },
        oneOf: [
          {
            '&if': "./category === 'cat1'",
            properties: {
              field1: { type: 'string', default: 'default1' },
              field2: { type: 'number', default: 100 },
            },
          },
          {
            '&if': "./category === 'cat2'",
            properties: {
              field3: { type: 'boolean', default: false },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set cat1 initial values
      node.setValue({
        category: 'cat1',
        field1: 'value1',
        field2: 200,
      });

      await delay();

      expect(node.value).toEqual({
        category: 'cat1',
        field1: 'value1',
        field2: 200,
      });

      // Set again with same category (no variant switch)
      node.setValue({
        category: 'cat1',
        field1: 'value1-updated',
        field2: 300,
      });

      await delay();

      // skipOneOfUpdate should be true (no switch)
      // Values should update normally
      expect(node.value).toEqual({
        category: 'cat1',
        field1: 'value1-updated',
        field2: 300,
      });
    });

    it('should handle mixed reset scenario with different field types', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['v1', 'v2'],
            default: 'v1',
          },
        },
        oneOf: [
          {
            '&if': "./variant === 'v1'",
            properties: {
              // Terminal, same type - should restore
              sharedString: { type: 'string', default: 'v1-default' },
              // Terminal, different type in v2
              mixedField: { type: 'string', default: 'v1-string' },
              // Non-terminal, same type
              sharedObject: {
                type: 'object',
                properties: {
                  prop: { type: 'string' },
                },
              },
              // Only in v1
              v1Only: { type: 'number' },
            },
          },
          {
            '&if': "./variant === 'v2'",
            properties: {
              // Terminal, same type - should restore
              sharedString: { type: 'string', default: 'v2-default' },
              // Terminal, different type
              mixedField: { type: 'number', default: 200 },
              // Non-terminal, same type
              sharedObject: {
                type: 'object',
                properties: {
                  prop: { type: 'string' },
                },
              },
              // Only in v2
              v2Only: { type: 'boolean', default: false },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set v1 with all fields
      node.setValue({
        variant: 'v1',
        sharedString: 'v1-custom',
        mixedField: 'string-value',
        sharedObject: { prop: 'v1-obj' },
        v1Only: 100,
      });

      await delay();

      // Switch to v2 via child (non-isolation)
      const variantNode = node.find('./variant') as StringNode;
      variantNode.setValue('v2');

      await delay();

      // Different behaviors:
      // 1. sharedString: terminal + same type + alternatedNode
      //    → preferLatestValue=true, uses restoreValue (undefined from __value__)
      //    → falls to initialValue 'v2-default'
      expect(node.value?.sharedString).toBe('v2-default');

      // 2. mixedField: terminal + different type
      //    → no alternatedNode match (type mismatch)
      //    → preferLatestValue=false, uses initialValue
      expect(node.value?.mixedField).toBe(200);

      // 3. sharedObject: non-terminal + same type + alternatedNode
      //    → isTerminalType=false, preferLatestValue=false
      //    → uses initialValue (undefined, no default specified)
      expect(node.value?.sharedObject).toBeUndefined();

      // 4. v2Only: no alternatedNode (new field)
      //    → preferLatestValue=false, uses initialValue
      expect(node.value?.v2Only).toBe(false);

      // 5. v1Only should be gone
      expect(node.value?.v1Only).toBeUndefined();
    });
  });

  describe('Value preservation patterns', () => {
    it('should preserve shared fields across oneOf switches when types match', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['cat1', 'cat2', 'cat3'],
            default: 'cat1',
          },
        },
        oneOf: [
          {
            '&if': "./category === 'cat1'",
            properties: {
              sharedField: { type: 'string', default: 'default1' },
              cat1Only: { type: 'number' },
            },
          },
          {
            '&if': "./category === 'cat2'",
            properties: {
              sharedField: { type: 'string', default: 'default2' },
              cat2Only: { type: 'boolean' },
            },
          },
          {
            '&if': "./category === 'cat3'",
            properties: {
              sharedField: { type: 'string', default: 'default3' },
              cat3Only: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set cat1 with shared field value
      node.setValue({
        category: 'cat1',
        sharedField: 'shared-value-1',
        cat1Only: 100,
      });

      await delay();

      expect(node.value?.sharedField).toBe('shared-value-1');

      // Switch to cat2 - sharedField type matches
      node.setValue({
        category: 'cat2',
        sharedField: 'shared-value-2',
        cat2Only: true,
      });

      await delay();

      expect(node.value?.sharedField).toBe('shared-value-2');

      // Switch to cat3 - sharedField type matches
      node.setValue({
        category: 'cat3',
        sharedField: 'shared-value-3',
        cat3Only: 'cat3-value',
      });

      await delay();

      expect(node.value?.sharedField).toBe('shared-value-3');

      // Round-trip back to cat1
      node.setValue({
        category: 'cat1',
        sharedField: 'final-shared-value',
        cat1Only: 999,
      });

      await delay();

      expect(node.value).toEqual({
        category: 'cat1',
        sharedField: 'final-shared-value',
        cat1Only: 999,
      });
    });

    it('should handle rapid sequential switches correctly', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          state: {
            type: 'string',
            enum: ['A', 'B', 'C'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./state === 'A'",
            properties: {
              value: { type: 'number', default: 1 },
            },
          },
          {
            '&if': "./state === 'B'",
            properties: {
              value: { type: 'number', default: 2 },
            },
          },
          {
            '&if': "./state === 'C'",
            properties: {
              value: { type: 'number', default: 3 },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Rapid switches: A → B → C → A
      node.setValue({ state: 'A', value: 100 });
      node.setValue({ state: 'B', value: 200 });
      node.setValue({ state: 'C', value: 300 });
      node.setValue({ state: 'A', value: 400 });

      await delay();

      // Final value should be the last set
      expect(node.value).toEqual({
        state: 'A',
        value: 400,
      });
    });
  });
});
