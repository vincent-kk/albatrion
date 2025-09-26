import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode anyOf', () => {
  it('anyOf 기본 동작 확인', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['personal', 'business'],
          default: 'personal',
        },
      },
      anyOf: [
        {
          '&if': "./type === 'personal'",
          properties: {
            hobby: {
              type: 'string',
              default: 'reading',
            },
          },
        },
        {
          '&if': "./type === 'business'",
          properties: {
            company: {
              type: 'string',
              default: 'TechCorp',
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

    // anyOf는 모든 스키마가 병합되어 사용 가능할 수 있음
    expect(node.find('type')).toBeDefined();

    // 기본적인 동작 확인
    const typeNode = node.find('type') as StringNode;
    expect(typeNode.value).toBe('personal');

    // 값 변경 테스트
    typeNode.setValue('business');
    await delay();
    expect(typeNode.value).toBe('business');
  });

  it('anyOf의 기본 스키마 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            name: { type: 'string' },
          },
        },
        {
          properties: {
            age: { type: 'number' },
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

    // anyOf에서 정의된 모든 속성이 사용 가능해야 함
    expect(node.find('name')).toBeDefined();
    expect(node.find('age')).toBeDefined();

    // 각 필드에 개별적으로 값 설정
    const nameNode = node.find('name') as StringNode;
    const ageNode = node.find('age') as NumberNode;

    nameNode.setValue('John');
    await delay();

    ageNode.setValue(30);
    await delay();

    // anyOf에서는 모든 속성이 활성화될 수 있음
    expect(node.value?.name).toBe('John');
    expect(node.value?.age).toBe(30);
  });

  it('anyOf와 properties 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        common: { type: 'string', default: 'shared' },
      },
      anyOf: [
        {
          properties: {
            specific1: { type: 'string' },
          },
        },
        {
          properties: {
            specific2: { type: 'number' },
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

    // properties와 anyOf의 속성들이 모두 존재해야 함
    expect(node.find('common')).toBeDefined();
    expect(node.find('specific1')).toBeDefined();
    expect(node.find('specific2')).toBeDefined();

    expect(node.value?.common).toBe('shared');
  });

  describe('anyOf value preservation on schema change', () => {
    it('should preserve values for nodes in __anyOfIndices__', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['A', 'B', 'C'],
            default: 'A',
          },
        },
        anyOf: [
          {
            '&if': "./category === 'A'",
            properties: {
              fieldA1: { type: 'string' },
              fieldA2: { type: 'number' },
            },
          },
          {
            '&if': "./category === 'B'",
            properties: {
              fieldB1: { type: 'string' },
              fieldB2: { type: 'boolean' },
            },
          },
          {
            '&if': "./category === 'C'",
            properties: {
              fieldC1: { type: 'number' },
              fieldC2: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set initial values when category is 'A'
      const categoryNode = node.find('category') as StringNode;
      const fieldA1 = node.find('fieldA1') as StringNode;
      const fieldA2 = node.find('fieldA2') as NumberNode;

      fieldA1.setValue('test value A1');
      fieldA2.setValue(42);
      await delay();

      expect(node.value?.fieldA1).toBe('test value A1');
      expect(node.value?.fieldA2).toBe(42);

      // Change to category B - fieldA values should be cleared
      categoryNode.setValue('B');
      await delay();

      const fieldB1 = node.find('fieldB1') as StringNode;
      fieldB1.setValue('test value B1');
      await delay();

      expect(node.value?.fieldB1).toBe('test value B1');
      expect(node.value?.fieldA1).toBeUndefined(); // Should be cleared
      expect(node.value?.fieldA2).toBeUndefined(); // Should be cleared

      // Change back to category A - previous A values should NOT be preserved (not in anyOfIndices)
      categoryNode.setValue('A');
      await delay();

      expect(node.value?.fieldA1).toBeUndefined(); // Reset to default (undefined)
      expect(node.value?.fieldA2).toBeUndefined(); // Reset to default (undefined)
      expect(node.value?.fieldB1).toBeUndefined(); // Should be cleared
    });

    it('should preserve values when multiple anyOf conditions are active', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          enableFeatureA: { type: 'boolean', default: true },
          enableFeatureB: { type: 'boolean', default: false },
        },
        anyOf: [
          {
            '&if': './enableFeatureA === true',
            properties: {
              featureAConfig: {
                type: 'object',
                properties: {
                  settingA1: { type: 'string' },
                  settingA2: { type: 'number', default: 10 },
                },
              },
            },
          },
          {
            '&if': './enableFeatureB === true',
            properties: {
              featureBConfig: {
                type: 'object',
                properties: {
                  settingB1: { type: 'boolean', default: true },
                  settingB2: { type: 'string' },
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

      // Initially only featureA is enabled
      const featureAConfig = node.find('featureAConfig') as ObjectNode;
      expect(featureAConfig).toBeDefined();
      expect(featureAConfig.value?.settingA2).toBe(10);

      const settingA1 = featureAConfig.find('settingA1') as StringNode;
      settingA1.setValue('custom value A');
      await delay();

      // Enable featureB as well (both A and B active)
      const enableFeatureB = node.find('enableFeatureB') as any;
      enableFeatureB.setValue(true);
      await delay();

      // Both features should be active
      expect(node.value?.featureAConfig?.settingA1).toBe('custom value A'); // Preserved
      expect(node.value?.featureAConfig?.settingA2).toBe(10); // Default preserved
      expect(node.value?.featureBConfig?.settingB1).toBe(true); // New default

      // Set value in featureB
      const featureBConfig = node.find('featureBConfig') as ObjectNode;
      const settingB2 = featureBConfig.find('settingB2') as StringNode;
      settingB2.setValue('custom value B');
      await delay();

      // Disable featureA
      const enableFeatureA = node.find('enableFeatureA') as any;
      enableFeatureA.setValue(false);
      await delay();

      // FeatureA should be cleared, featureB should remain
      expect(node.value?.featureAConfig).toBeUndefined();
      expect(node.value?.featureBConfig?.settingB2).toBe('custom value B'); // Preserved

      // Re-enable featureA
      enableFeatureA.setValue(true);
      await delay();

      // FeatureA values should be reset to defaults
      expect(node.value?.featureAConfig?.settingA1).toBeUndefined(); // No default
      expect(node.value?.featureAConfig?.settingA2).toBe(10); // Default value
      expect(node.value?.featureBConfig?.settingB2).toBe('custom value B'); // Still preserved
    });

    it('should handle nested anyOf with value preservation', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['simple', 'advanced'],
            default: 'simple',
          },
        },
        anyOf: [
          {
            '&if': "./mode === 'simple'",
            properties: {
              simpleConfig: { type: 'string', default: 'default simple' },
            },
          },
          {
            '&if': "./mode === 'advanced'",
            properties: {
              advancedConfig: {
                type: 'object',
                properties: {
                  subMode: {
                    type: 'string',
                    enum: ['option1', 'option2'],
                    default: 'option1',
                  },
                },
                anyOf: [
                  {
                    '&if': "./subMode === 'option1'",
                    properties: {
                      option1Data: { type: 'string' },
                    },
                  },
                  {
                    '&if': "./subMode === 'option2'",
                    properties: {
                      option2Data: { type: 'number' },
                    },
                  },
                ],
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

      // Start in simple mode
      expect(node.value?.simpleConfig).toBe('default simple');

      const simpleConfig = node.find('simpleConfig') as StringNode;
      simpleConfig.setValue('custom simple');
      await delay();

      // Switch to advanced mode
      const modeNode = node.find('mode') as StringNode;
      modeNode.setValue('advanced');
      await delay();

      // Simple config should be cleared
      expect(node.value?.simpleConfig).toBeUndefined();
      expect(node.value?.advancedConfig?.subMode).toBe('option1');

      // Set value in nested anyOf
      const advancedConfig = node.find('advancedConfig') as ObjectNode;
      const option1Data = advancedConfig.find('option1Data') as StringNode;
      option1Data.setValue('nested value 1');
      await delay();

      // Change nested anyOf
      const subMode = advancedConfig.find('subMode') as StringNode;
      subMode.setValue('option2');
      await delay();

      expect(node.value?.advancedConfig?.option1Data).toBeUndefined();

      const option2Data = advancedConfig.find('option2Data') as NumberNode;
      option2Data.setValue(123);
      await delay();

      // Switch back to simple mode
      modeNode.setValue('simple');
      await delay();

      // Advanced config should be cleared, simple config reset to default
      expect(node.value?.simpleConfig).toBe('default simple'); // Reset to default
      expect(node.value?.advancedConfig).toBeUndefined();
    });

    it('should handle anyOf with array indices preservation', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['text', 'number'],
                  default: 'text',
                },
              },
              anyOf: [
                {
                  '&if': "./type === 'text'",
                  properties: {
                    textValue: { type: 'string', default: 'default text' },
                  },
                },
                {
                  '&if': "./type === 'number'",
                  properties: {
                    numberValue: { type: 'number', default: 0 },
                  },
                },
              ],
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      const itemsNode = node.find('items') as any;

      // Add first item
      itemsNode.push();
      await delay();

      // Add second item
      itemsNode.push();
      await delay();

      // Configure first item as text
      const item0 = itemsNode.find('0') as ObjectNode;
      const textValue0 = item0.find('textValue') as StringNode;
      textValue0.setValue('custom text 1');
      await delay();

      // Configure second item as number
      const item1 = itemsNode.find('1') as ObjectNode;
      const type1 = item1.find('type') as StringNode;
      type1.setValue('number');
      await delay();

      const numberValue1 = item1.find('numberValue') as NumberNode;
      numberValue1.setValue(42);
      await delay();

      expect(node.value?.items?.[0]?.textValue).toBe('custom text 1');
      expect(node.value?.items?.[1]?.numberValue).toBe(42);

      // Change first item type to number
      const type0 = item0.find('type') as StringNode;
      type0.setValue('number');
      await delay();

      expect(node.value?.items?.[0]?.textValue).toBeUndefined();
      expect(node.value?.items?.[0]?.numberValue).toBe(0); // Default value

      // Change it back to text
      type0.setValue('text');
      await delay();

      expect(node.value?.items?.[0]?.textValue).toBe('default text'); // Reset to default
      expect(node.value?.items?.[0]?.numberValue).toBeUndefined();
    });

    it('should correctly handle __anyOfIndices__ state transitions', async () => {
      const schema: JsonSchema = {
        type: 'object',
        anyOf: [
          {
            '&if': 'true', // Always active
            properties: {
              alwaysPresent: { type: 'string', default: 'always here' },
            },
          },
          {
            '&if': './conditional === true',
            properties: {
              conditionalField: { type: 'number' },
            },
          },
        ],
        properties: {
          conditional: { type: 'boolean', default: false },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Initially, only first anyOf is active
      expect(node.value?.alwaysPresent).toBe('always here');
      expect(node.value?.conditionalField).toBeUndefined();

      const alwaysPresent = node.find('alwaysPresent') as StringNode;
      alwaysPresent.setValue('modified always');
      await delay();

      // Activate second anyOf condition
      const conditional = node.find('conditional') as any;
      conditional.setValue(true);
      await delay();

      // Both anyOf branches should be active
      expect(node.value?.alwaysPresent).toBe('modified always'); // Preserved (in __anyOfIndices__)
      expect(node.value?.conditionalField).toBeUndefined(); // New field, no value yet

      const conditionalField = node.find('conditionalField') as NumberNode;
      conditionalField.setValue(99);
      await delay();

      // Deactivate second anyOf
      conditional.setValue(false);
      await delay();

      // First anyOf remains, second is cleared
      expect(node.value?.alwaysPresent).toBe('modified always'); // Still preserved
      expect(node.value?.conditionalField).toBeUndefined(); // Cleared

      // Reactivate second anyOf
      conditional.setValue(true);
      await delay();

      // Second field should be reset (not in previous __anyOfIndices__)
      expect(node.value?.conditionalField).toBeUndefined(); // No default, so undefined
    });
  });
});
