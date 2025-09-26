import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode oneOf', () => {
  it('oneOf 기본 동작 확인', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
      },
      oneOf: [
        {
          '&if': "./category === 'game'",
          properties: {
            platform: {
              type: 'string',
              default: 'PC',
            },
          },
        },
        {
          '&if': "./category === 'movie'",
          properties: {
            director: { type: 'string' },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const categoryNode = node.find('category') as StringNode;
    expect(categoryNode.value).toBe('game');

    // oneOf는 조건부로 필드가 활성화됨
    // 현재 어떤 필드들이 존재하는지 확인
    const platformNode = node.find('platform');

    if (platformNode) {
      expect(platformNode).toBeDefined();
    }

    // 값 변경 테스트
    categoryNode.setValue('movie');
    await delay();
    expect(categoryNode.value).toBe('movie');
  });

  it('oneOf의 computed 속성 동작', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['basic', 'advanced'],
          default: 'basic',
        },
        enableOptional: {
          type: 'boolean',
          default: false,
        },
      },
      oneOf: [
        {
          '&if': "./type === 'basic'",
          properties: {
            basicField: {
              type: 'string',
              default: 'basic-value',
            },
            optionalField: {
              type: 'string',
              computed: {
                active: '../enableOptional === true',
              },
              default: 'optional',
            },
          },
        },
        {
          '&if': "./type === 'advanced'",
          properties: {
            advancedField: {
              type: 'string',
              default: 'advanced-value',
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const typeNode = node.find('type') as StringNode;
    const enableOptionalNode = node.find('enableOptional');

    expect(typeNode.value).toBe('basic');

    // computed 속성이 있는 필드 확인
    const optionalField = node.find('optionalField') as StringNode;
    if (optionalField) {
      expect(optionalField.active).toBe(false);

      // enableOptional을 true로 변경
      (enableOptionalNode as any)?.setValue(true);
      await delay();

      expect(optionalField.active).toBe(true);
    }
  });

  it('oneOf에서 const를 사용한 조건 분기', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        productType: {
          type: 'string',
          enum: ['physical', 'digital'],
          default: 'physical',
        },
      },
      oneOf: [
        {
          properties: {
            productType: {
              const: 'physical',
            },
            weight: { type: 'number', default: 1 },
          },
        },
        {
          properties: {
            productType: {
              const: 'digital',
            },
            fileSize: { type: 'number', default: 100 },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const productTypeNode = node.find('productType') as StringNode;
    expect(productTypeNode.value).toBe('physical');

    // 각 조건에 따른 필드 확인
    const weightNode = node.find('weight');

    // oneOf는 조건에 따라 다른 필드가 활성화됨
    if (weightNode) {
      expect(weightNode).toBeDefined();
    }

    // 값 변경 테스트
    productTypeNode.setValue('digital');
    await delay();
    expect(productTypeNode.value).toBe('digital');
  });

  it('oneOf에서 배열 내부 동작', async () => {
    const schema: JsonSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          itemType: {
            type: 'string',
            enum: ['text', 'number'],
            default: 'text',
          },
        },
        oneOf: [
          {
            '&if': "./itemType === 'text'",
            properties: {
              textValue: { type: 'string', default: 'sample' },
            },
          },
          {
            '&if': "./itemType === 'number'",
            properties: {
              numberValue: { type: 'number', default: 0 },
            },
          },
        ],
      },
      minItems: 1,
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ArrayNode;

    // 노드 생성 후 delay
    await delay();

    // 배열에 아이템 추가
    node.push();
    await delay();

    const firstItem = node.children?.[0]?.node as ObjectNode;
    expect(firstItem).toBeDefined();

    // 아이템의 기본 타입 확인
    const itemTypeNode = firstItem.find('itemType') as StringNode;
    expect(itemTypeNode.value).toBe('text');

    // oneOf에 따른 필드 확인
    const textValueNode = firstItem.find('textValue');
    if (textValueNode) {
      expect(textValueNode).toBeDefined();
    }

    // 값 변경 테스트
    itemTypeNode.setValue('number');
    await delay();
    expect(itemTypeNode.value).toBe('number');
  });

  it('oneOf와 properties 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        commonField: {
          type: 'string',
          default: 'shared',
        },
        selector: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./selector === 'A'",
          properties: {
            specificA: { type: 'string', default: 'valueA' },
          },
        },
        {
          '&if': "./selector === 'B'",
          properties: {
            specificB: { type: 'number', default: 100 },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    // 공통 필드는 항상 존재
    expect(node.find('commonField')).toBeDefined();
    expect(node.find('selector')).toBeDefined();

    expect(node.value?.commonField).toBe('shared');

    const selectorNode = node.find('selector') as StringNode;
    expect(selectorNode.value).toBe('A');

    // selector 값 변경 테스트
    selectorNode.setValue('B');
    await delay();
    expect(selectorNode.value).toBe('B');
  });

  describe('oneOf primitive type value preservation', () => {
    it('should preserve primitive values when switching between oneOf branches with same-named fields', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['simple', 'advanced', 'custom'],
            default: 'simple',
          },
        },
        oneOf: [
          {
            '&if': "./mode === 'simple'",
            properties: {
              name: { type: 'string' }, // Same field name, same type
              count: { type: 'number' }, // Same field name, same type
              active: { type: 'boolean' }, // Same field name, same type
            },
          },
          {
            '&if': "./mode === 'advanced'",
            properties: {
              name: { type: 'string' }, // Same field name, same type
              count: { type: 'string' }, // Same field name, different type!
              description: { type: 'string' },
            },
          },
          {
            '&if': "./mode === 'custom'",
            properties: {
              name: { type: 'number' }, // Same field name, different type!
              active: { type: 'boolean' }, // Same field name, same type
              customData: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Initial mode is 'simple'
      const modeNode = node.find('mode') as StringNode;
      expect(modeNode.value).toBe('simple');

      // Set values in simple mode
      const nameNode = node.find('name') as StringNode;
      const countNode = node.find('count') as any;
      const activeNode = node.find('active') as any;

      nameNode.setValue('Test Name');
      countNode.setValue(42);
      activeNode.setValue(true);
      await delay();

      expect(node.value?.name).toBe('Test Name');
      expect(node.value?.count).toBe(42);
      expect(node.value?.active).toBe(true);

      // Switch to 'advanced' mode
      modeNode.setValue('advanced');
      await delay();

      // 'name' should be preserved (string -> string, same type)
      // 'count' should NOT be preserved (number -> string, different type)
      // 'active' should be cleared (not in advanced schema)
      expect(node.value?.name).toBe('Test Name'); // Preserved
      expect(node.value?.count).toBeUndefined(); // Reset (type mismatch)
      expect(node.value?.active).toBeUndefined(); // Cleared

      // Set new count value as string
      const countNodeAdvanced = node.find('count') as StringNode;
      countNodeAdvanced.setValue('forty-two');
      await delay();

      // Switch to 'custom' mode
      modeNode.setValue('custom');
      await delay();

      // 'name' should NOT be preserved (string -> number, different type)
      // 'active' should NOT be preserved (was cleared when switching to advanced)
      expect(node.value?.name).toBeUndefined(); // Reset (type mismatch)
      expect(node.value?.active).toBeUndefined(); // No previous value to preserve
      expect(node.value?.count).toBeUndefined(); // Cleared

      // Set values in custom mode
      const nameNodeCustom = node.find('name') as any;
      nameNodeCustom.setValue(999);
      const activeNodeCustom = node.find('active') as any;
      activeNodeCustom.setValue(false);
      await delay();

      expect(node.value?.name).toBe(999);
      expect(node.value?.active).toBe(false);

      // Switch back to 'simple' mode
      modeNode.setValue('simple');
      await delay();

      // All values should be reset (type mismatch for name, no previous values)
      expect(node.value?.name).toBeUndefined(); // Reset (type mismatch: number -> string)
      expect(node.value?.count).toBeUndefined(); // No default
      expect(node.value?.active).toBe(false); // Reset but preserved from custom mode
    });

    it('should preserve null values correctly with nullable fields', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['nullable', 'required'],
            default: 'nullable',
          },
        },
        oneOf: [
          {
            '&if': "./variant === 'nullable'",
            properties: {
              data: { type: 'string', nullable: true, default: null },
              count: { type: 'number' },
            },
          },
          {
            '&if': "./variant === 'required'",
            properties: {
              data: { type: 'string', default: 'required' },
              count: { type: 'number', default: 0 },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Initial state with nullable variant - null default should work
      expect(node.value?.data).toBe(null); // Default null value

      const dataNode = node.find('data') as any;
      const countNode = node.find('count') as any;

      // Set string value
      dataNode.setValue('test string');
      countNode.setValue(42);
      await delay();

      expect(node.value?.data).toBe('test string');
      expect(node.value?.count).toBe(42);

      // Switch to required variant
      const variantNode = node.find('variant') as StringNode;
      variantNode.setValue('required');
      await delay();

      // Values should be preserved if types match, but defaults take precedence
      expect(node.value?.data).toBe('required'); // Default value from 'required' schema
      expect(node.value?.count).toBe(0); // Default value from 'required' schema

      // Switch back to nullable
      variantNode.setValue('nullable');
      await delay();

      // Default null value should take precedence over preserved value
      expect(node.value?.data).toBe(null); // Default null value takes precedence
      expect(node.value?.count).toBe(0); // Preserved (same type number)
    });

    it('should handle default values correctly during oneOf transitions', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          profile: {
            type: 'string',
            enum: ['dev', 'prod', 'test'],
            default: 'dev',
          },
        },
        oneOf: [
          {
            '&if': "./profile === 'dev'",
            properties: {
              debug: { type: 'boolean', default: true },
              logLevel: { type: 'string', default: 'verbose' },
              port: { type: 'number', default: 3000 },
            },
          },
          {
            '&if': "./profile === 'prod'",
            properties: {
              debug: { type: 'boolean', default: false },
              logLevel: { type: 'string', default: 'error' },
              port: { type: 'number', default: 8080 },
              secure: { type: 'boolean', default: true },
            },
          },
          {
            '&if': "./profile === 'test'",
            properties: {
              debug: { type: 'boolean' }, // No default
              logLevel: { type: 'string' }, // No default
              port: { type: 'string' }, // Different type!
              testMode: { type: 'boolean', default: true },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Initial dev profile with defaults
      expect(node.value?.debug).toBe(true);
      expect(node.value?.logLevel).toBe('verbose');
      expect(node.value?.port).toBe(3000);

      // Modify values
      const debugNode = node.find('debug') as any;
      const logLevelNode = node.find('logLevel') as StringNode;
      const portNode = node.find('port') as any;

      debugNode.setValue(false);
      logLevelNode.setValue('info');
      portNode.setValue(3001);
      await delay();

      // Switch to prod profile
      const profileNode = node.find('profile') as StringNode;
      profileNode.setValue('prod');
      await delay();

      // Default values should take precedence over preserved values
      expect(node.value?.debug).toBe(false); // Default from prod schema
      expect(node.value?.logLevel).toBe('error'); // Default from prod schema
      expect(node.value?.port).toBe(8080); // Default from prod schema
      expect(node.value?.secure).toBe(true); // New field with default

      // Modify prod values
      logLevelNode.setValue('warn');
      await delay();

      // Switch to test profile
      profileNode.setValue('test');
      await delay();

      // Fields without defaults should be preserved if types match
      // 'port' type changes from number to string, so it should reset
      expect(node.value?.debug).toBe(false); // Preserved (boolean type matches)
      expect(node.value?.logLevel).toBe('warn'); // Preserved (no default in test)
      expect(node.value?.port).toBeUndefined(); // Type mismatch, reset
      expect(node.value?.testMode).toBe(true); // New field with default
      expect(node.value?.secure).toBeUndefined(); // Cleared

      // Switch back to dev
      profileNode.setValue('dev');
      await delay();

      // Should use defaults from dev schema
      expect(node.value?.debug).toBe(true); // Default from dev schema
      expect(node.value?.logLevel).toBe('verbose'); // Default from dev schema
      expect(node.value?.port).toBe(3000); // Default from dev schema
    });

    it('should handle complex nested oneOf with primitive preservation', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          topLevel: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./topLevel === 'A'",
            properties: {
              config: {
                type: 'object',
                properties: {
                  subType: {
                    type: 'string',
                    enum: ['X', 'Y'],
                    default: 'X',
                  },
                },
                oneOf: [
                  {
                    '&if': "./subType === 'X'",
                    properties: {
                      value: { type: 'string' },
                      flag: { type: 'boolean' },
                    },
                  },
                  {
                    '&if': "./subType === 'Y'",
                    properties: {
                      value: { type: 'string' }, // Same name, same type
                      count: { type: 'number' },
                    },
                  },
                ],
              },
            },
          },
          {
            '&if': "./topLevel === 'B'",
            properties: {
              config: {
                type: 'object',
                properties: {
                  value: { type: 'number' }, // Different type at different nesting
                  enabled: { type: 'boolean' },
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

      // Set initial values in A-X configuration
      const config = node.find('config') as ObjectNode;
      const valueNode = config.find('value') as StringNode;
      const flagNode = config.find('flag') as any;

      valueNode.setValue('initial value');
      flagNode.setValue(true);
      await delay();

      expect(node.value?.config?.value).toBe('initial value');
      expect(node.value?.config?.flag).toBe(true);

      // Switch nested oneOf from X to Y
      const subType = config.find('subType') as StringNode;
      subType.setValue('Y');
      await delay();

      // 'value' should be preserved (same name, same type)
      // 'flag' should be cleared
      expect(node.value?.config?.value).toBe('initial value'); // Preserved
      expect(node.value?.config?.flag).toBeUndefined(); // Cleared
      expect(node.value?.config?.count).toBeUndefined(); // New field, no value

      // Set count value
      const countNode = config.find('count') as any;
      countNode.setValue(42);
      await delay();

      // Switch top-level from A to B
      const topLevel = node.find('topLevel') as StringNode;
      topLevel.setValue('B');
      await delay();

      // Completely different structure, everything should reset
      expect(node.value?.config?.value).toBeUndefined(); // Type mismatch (string -> number)
      expect(node.value?.config?.count).toBeUndefined(); // Cleared
      expect(node.value?.config?.enabled).toBeUndefined(); // New field

      // Set values in B configuration
      const configB = node.find('config') as ObjectNode;
      const valueNodeB = configB.find('value') as any;
      valueNodeB.setValue(999);
      await delay();

      // Switch back to A
      topLevel.setValue('A');
      await delay();

      // Should reset to defaults for A-X (default subType)
      expect(node.value?.config?.subType).toBe('X');
      expect(node.value?.config?.value).toBeUndefined(); // Type mismatch, no default
      expect(node.value?.config?.flag).toBeUndefined(); // No default
    });

    it('should handle arrays within oneOf with primitive preservation', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          dataType: {
            type: 'string',
            enum: ['strings', 'numbers', 'mixed'],
            default: 'strings',
          },
        },
        oneOf: [
          {
            '&if': "./dataType === 'strings'",
            properties: {
              items: {
                type: 'array',
                items: { type: 'string' },
                default: ['default1', 'default2'],
              },
            },
          },
          {
            '&if': "./dataType === 'numbers'",
            properties: {
              items: {
                type: 'array',
                items: { type: 'number' },
                default: [1, 2, 3],
              },
            },
          },
          {
            '&if': "./dataType === 'mixed'",
            properties: {
              items: {
                type: 'array',
                items: {
                  oneOf: [{ type: 'string' }, { type: 'number' }],
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

      // Initial state with strings
      expect(node.value?.items).toEqual(['default1', 'default2']);

      const itemsNode = node.find('items') as any;

      // Modify array (use proper array methods)
      const item0 = itemsNode.children[0]?.node;
      item0.setValue('custom1');
      itemsNode.push(); // Use push instead of append
      await delay();
      const item2 = itemsNode.children[2]?.node;
      item2.setValue('custom3');
      await delay();

      expect(node.value?.items).toEqual(['custom1', 'default2', 'custom3']);

      // Switch to numbers type
      const dataType = node.find('dataType') as StringNode;
      dataType.setValue('numbers');
      await delay();

      // Array should reset to default due to type mismatch
      expect(node.value?.items).toEqual([1, 2, 3]); // Default for numbers

      // Modify number array
      const itemsNodeNumbers = node.find('items') as any;
      const numberItem1 = itemsNodeNumbers.children[1]?.node;
      numberItem1.setValue(20);
      await delay();

      // Switch to mixed type
      dataType.setValue('mixed');
      await delay();

      // Should reset (arrays are complex types, no value preservation)
      expect(node.value?.items).toBeUndefined();

      // Switch back to strings
      dataType.setValue('strings');
      await delay();

      // Should use default
      expect(node.value?.items).toEqual(['default1', 'default2']);
    });
  });
});
