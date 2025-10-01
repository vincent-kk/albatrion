import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('Conditional Schema setValue behavior', () => {
  describe('oneOf - automatic field removal on setValue', () => {
    it('should remove fields not matching oneOf condition when setValue is called (shallow level)', async () => {
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
              price: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Set value with game category and price (should work)
      node.setValue({ category: 'game', price: 100 });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(100);

      // Test 2: Set value with movie category and price (price should be removed)
      node.setValue({ category: 'movie', price: 200 });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined();

      // Test 3: Multiple setValue calls - game with price
      node.setValue({ category: 'game', price: 300 });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(300);

      // Test 4: Multiple setValue calls - movie with price (should remove)
      node.setValue({ category: 'movie', price: 400 });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined();

      // Test 5: Rapid consecutive setValue calls
      node.setValue({ category: 'game', price: 500 });
      node.setValue({ category: 'movie', price: 600 });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined();
    });

    it('should handle multiple conditional fields at shallow level', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie', 'book'],
            default: 'game',
          },
        },
        oneOf: [
          {
            '&if': "./category === 'game'",
            properties: {
              platform: { type: 'string' },
              rating: { type: 'string' },
            },
          },
          {
            '&if': "./category === 'movie'",
            properties: {
              director: { type: 'string' },
              duration: { type: 'number' },
            },
          },
          {
            '&if': "./category === 'book'",
            properties: {
              author: { type: 'string' },
              pages: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set game with all fields including invalid ones
      node.setValue({
        category: 'game',
        platform: 'PC',
        rating: 'E',
        director: 'Invalid',
        duration: 120,
        author: 'Invalid',
        pages: 300,
      });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.platform).toBe('PC');
      expect(node.value?.rating).toBe('E');
      expect(node.value?.director).toBeUndefined();
      expect(node.value?.duration).toBeUndefined();
      expect(node.value?.author).toBeUndefined();
      expect(node.value?.pages).toBeUndefined();

      // Switch to movie with all fields
      node.setValue({
        category: 'movie',
        platform: 'Invalid',
        rating: 'Invalid',
        director: 'Nolan',
        duration: 180,
        author: 'Invalid',
        pages: 300,
      });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.platform).toBeUndefined();
      expect(node.value?.rating).toBeUndefined();
      expect(node.value?.director).toBe('Nolan');
      expect(node.value?.duration).toBe(180);
      expect(node.value?.author).toBeUndefined();
      expect(node.value?.pages).toBeUndefined();
    });

    it('should remove fields not matching oneOf condition at nested level', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          product: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['digital', 'physical'],
                default: 'digital',
              },
            },
            oneOf: [
              {
                '&if': "./type === 'digital'",
                properties: {
                  fileSize: { type: 'number' },
                  downloadUrl: { type: 'string' },
                },
              },
              {
                '&if': "./type === 'physical'",
                properties: {
                  weight: { type: 'number' },
                  dimensions: { type: 'string' },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Set digital product with physical fields (should remove physical fields)
      node.setValue({
        product: {
          type: 'digital',
          fileSize: 100,
          downloadUrl: 'http://example.com',
          weight: 500,
          dimensions: '10x10',
        },
      });
      await delay();

      expect(node.value?.product?.type).toBe('digital');
      expect(node.value?.product?.fileSize).toBe(100);
      expect(node.value?.product?.downloadUrl).toBe('http://example.com');
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.dimensions).toBeUndefined();

      // Test 2: Switch to physical with all fields
      node.setValue({
        product: {
          type: 'physical',
          fileSize: 200,
          downloadUrl: 'http://invalid.com',
          weight: 1000,
          dimensions: '20x20',
        },
      });
      await delay();

      expect(node.value?.product?.type).toBe('physical');
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.downloadUrl).toBeUndefined();
      expect(node.value?.product?.weight).toBe(1000);
      expect(node.value?.product?.dimensions).toBe('20x20');
    });

    it('should remove fields not matching oneOf condition at deep nested level', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            properties: {
              department: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['engineering', 'sales'],
                    default: 'engineering',
                  },
                },
                oneOf: [
                  {
                    '&if': "./type === 'engineering'",
                    properties: {
                      techStack: { type: 'string' },
                      projectCount: { type: 'number' },
                    },
                  },
                  {
                    '&if': "./type === 'sales'",
                    properties: {
                      revenue: { type: 'number' },
                      clientCount: { type: 'number' },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Set engineering with all fields
      node.setValue({
        company: {
          department: {
            type: 'engineering',
            techStack: 'React',
            projectCount: 5,
            revenue: 1000000,
            clientCount: 50,
          },
        },
      });
      await delay();

      expect(node.value?.company?.department?.type).toBe('engineering');
      expect(node.value?.company?.department?.techStack).toBe('React');
      expect(node.value?.company?.department?.projectCount).toBe(5);
      expect(node.value?.company?.department?.revenue).toBeUndefined();
      expect(node.value?.company?.department?.clientCount).toBeUndefined();

      // Test 2: Switch to sales
      node.setValue({
        company: {
          department: {
            type: 'sales',
            techStack: 'Invalid',
            projectCount: 10,
            revenue: 2000000,
            clientCount: 100,
          },
        },
      });
      await delay();

      expect(node.value?.company?.department?.type).toBe('sales');
      expect(node.value?.company?.department?.techStack).toBeUndefined();
      expect(node.value?.company?.department?.projectCount).toBeUndefined();
      expect(node.value?.company?.department?.revenue).toBe(2000000);
      expect(node.value?.company?.department?.clientCount).toBe(100);
    });
  });

  describe('anyOf - automatic field removal on setValue', () => {
    it('should remove fields not matching anyOf condition at shallow level', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          enableFeatureA: { type: 'boolean', default: false },
          enableFeatureB: { type: 'boolean', default: false },
        },
        anyOf: [
          {
            '&if': './enableFeatureA === true',
            properties: {
              featureAConfig: { type: 'string' },
              featureAValue: { type: 'number' },
            },
          },
          {
            '&if': './enableFeatureB === true',
            properties: {
              featureBConfig: { type: 'string' },
              featureBValue: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Neither feature enabled, set all fields (should remove all)
      node.setValue({
        enableFeatureA: false,
        enableFeatureB: false,
        featureAConfig: 'configA',
        featureAValue: 100,
        featureBConfig: 'configB',
        featureBValue: 200,
      });
      await delay();

      expect(node.value?.enableFeatureA).toBe(false);
      expect(node.value?.enableFeatureB).toBe(false);
      expect(node.value?.featureAConfig).toBeUndefined();
      expect(node.value?.featureAValue).toBeUndefined();
      expect(node.value?.featureBConfig).toBeUndefined();
      expect(node.value?.featureBValue).toBeUndefined();

      // Test 2: Enable feature A only
      node.setValue({
        enableFeatureA: true,
        enableFeatureB: false,
        featureAConfig: 'configA',
        featureAValue: 100,
        featureBConfig: 'configB',
        featureBValue: 200,
      });
      await delay();

      expect(node.value?.enableFeatureA).toBe(true);
      expect(node.value?.featureAConfig).toBe('configA');
      expect(node.value?.featureAValue).toBe(100);
      expect(node.value?.featureBConfig).toBeUndefined();
      expect(node.value?.featureBValue).toBeUndefined();

      // Test 3: Enable both features
      node.setValue({
        enableFeatureA: true,
        enableFeatureB: true,
        featureAConfig: 'configA',
        featureAValue: 100,
        featureBConfig: 'configB',
        featureBValue: 200,
      });
      await delay();

      expect(node.value?.enableFeatureA).toBe(true);
      expect(node.value?.enableFeatureB).toBe(true);
      expect(node.value?.featureAConfig).toBe('configA');
      expect(node.value?.featureAValue).toBe(100);
      expect(node.value?.featureBConfig).toBe('configB');
      expect(node.value?.featureBValue).toBe(200);
    });

    it('should remove fields not matching anyOf condition at nested level', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            properties: {
              enableAdvanced: { type: 'boolean', default: false },
              enableExpert: { type: 'boolean', default: false },
            },
            anyOf: [
              {
                '&if': './enableAdvanced === true',
                properties: {
                  advancedOption1: { type: 'string' },
                  advancedOption2: { type: 'number' },
                },
              },
              {
                '&if': './enableExpert === true',
                properties: {
                  expertOption1: { type: 'string' },
                  expertOption2: { type: 'boolean' },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Neither enabled, set all fields
      node.setValue({
        settings: {
          enableAdvanced: false,
          enableExpert: false,
          advancedOption1: 'adv1',
          advancedOption2: 100,
          expertOption1: 'exp1',
          expertOption2: true,
        },
      });
      await delay();

      expect(node.value?.settings?.advancedOption1).toBeUndefined();
      expect(node.value?.settings?.advancedOption2).toBeUndefined();
      expect(node.value?.settings?.expertOption1).toBeUndefined();
      expect(node.value?.settings?.expertOption2).toBeUndefined();

      // Test 2: Enable advanced only
      node.setValue({
        settings: {
          enableAdvanced: true,
          enableExpert: false,
          advancedOption1: 'adv1',
          advancedOption2: 100,
          expertOption1: 'exp1',
          expertOption2: true,
        },
      });
      await delay();

      expect(node.value?.settings?.advancedOption1).toBe('adv1');
      expect(node.value?.settings?.advancedOption2).toBe(100);
      expect(node.value?.settings?.expertOption1).toBeUndefined();
      expect(node.value?.settings?.expertOption2).toBeUndefined();
    });
  });

  describe('combined oneOf and anyOf - automatic field removal on setValue', () => {
    it('should handle oneOf and anyOf field removal independently', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['A', 'B'], default: 'A' },
          enableExtra: { type: 'boolean', default: false },
        },
        oneOf: [
          {
            '&if': "./mode === 'A'",
            properties: {
              fieldA: { type: 'string' },
            },
          },
          {
            '&if': "./mode === 'B'",
            properties: {
              fieldB: { type: 'number' },
            },
          },
        ],
        anyOf: [
          {
            '&if': './enableExtra === true',
            properties: {
              extraField: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Mode A without extra, set all fields
      node.setValue({
        mode: 'A',
        enableExtra: false,
        fieldA: 'valueA',
        fieldB: 100,
        extraField: 'extra',
      });
      await delay();

      expect(node.value?.mode).toBe('A');
      expect(node.value?.fieldA).toBe('valueA');
      expect(node.value?.fieldB).toBeUndefined(); // oneOf removed
      expect(node.value?.extraField).toBeUndefined(); // anyOf removed

      // Test 2: Mode A with extra enabled
      node.setValue({
        mode: 'A',
        enableExtra: true,
        fieldA: 'valueA',
        fieldB: 100,
        extraField: 'extra',
      });
      await delay();

      expect(node.value?.fieldA).toBe('valueA');
      expect(node.value?.fieldB).toBeUndefined(); // oneOf removed
      expect(node.value?.extraField).toBe('extra'); // anyOf preserved

      // Test 3: Mode B with extra enabled
      node.setValue({
        mode: 'B',
        enableExtra: true,
        fieldA: 'valueA',
        fieldB: 200,
        extraField: 'extra2',
      });
      await delay();

      expect(node.value?.fieldA).toBeUndefined(); // oneOf removed
      expect(node.value?.fieldB).toBe(200); // oneOf preserved
      expect(node.value?.extraField).toBe('extra2'); // anyOf preserved
    });
  });

  describe('edge cases - consistency and timing', () => {
    it('should handle child node direct modification after parent setValue', async () => {
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
              price: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set initial value with game and price
      node.setValue({ category: 'game', price: 100 });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(100);

      // Get child nodes
      const categoryNode = node.find('./category') as StringNode;
      const priceNode = node.find('./price') as NumberNode | null;

      expect(priceNode).not.toBeNull();
      expect(priceNode?.value).toBe(100);

      // Modify category through child node to 'movie' (should remove price)
      categoryNode.setValue('movie');
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined();

      // Note: The price node still exists in the tree even though category is 'movie'
      // When we modify the child node directly, the value propagates to parent
      const priceNodeAfter = node.find('./price') as NumberNode | null;
      expect(priceNodeAfter).not.toBeNull(); // Node exists

      // If we set price through child node when category is 'movie',
      // the value will propagate but will be filtered by parent setValue
      priceNodeAfter?.setValue(999);
      await delay();

      expect(node.value?.category).toBe('movie');
      // The price value appears because child setValue propagates to parent
      expect(node.value?.price).toBeUndefined();

      // However, if we do parent setValue with movie category, price will be removed
      node.setValue({ category: 'movie', price: 888 });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined(); // Removed by parent setValue filtering

      // Switch back to 'game' through child node
      categoryNode.setValue('game');
      await delay();

      expect(node.value?.category).toBe('game');
      // Price is undefined because it was removed by previous parent setValue
      expect(node.value?.price).toBeUndefined();

      // Can set new price value
      const priceNodeRestored = node.find('./price') as NumberNode | null;
      expect(priceNodeRestored).not.toBeNull();

      priceNodeRestored?.setValue(200);
      await delay();

      expect(node.value?.price).toBe(200);
    });

    it('should handle partial updates correctly (implicit field removal)', async () => {
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
              price: { type: 'number' },
              platform: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set full value with game, price, and platform
      node.setValue({ category: 'game', price: 100, platform: 'PC' });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(100);
      expect(node.value?.platform).toBe('PC');

      // Partial update: only change category to 'movie' without mentioning price/platform
      // This should remove price and platform fields
      node.setValue({ category: 'movie' });
      await delay();

      expect(node.value?.category).toBe('movie');
      expect(node.value?.price).toBeUndefined();
      expect(node.value?.platform).toBeUndefined();

      // Partial update: switch back to 'game' with only price
      node.setValue({ category: 'game', price: 200 });
      await delay();

      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(200);
      expect(node.value?.platform).toBeUndefined(); // Platform not set
    });

    it('should handle cascading removals with multi-level dependencies', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          levelA: {
            type: 'string',
            enum: ['A1', 'A2'],
            default: 'A1',
          },
        },
        oneOf: [
          {
            '&if': "./levelA === 'A1'",
            properties: {
              levelB: {
                type: 'string',
                enum: ['B1', 'B2'],
              },
            },
          },
        ],
        anyOf: [
          {
            '&if': "./levelB === 'B1'",
            properties: {
              levelC: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set all levels: A1 → B1 → C
      node.setValue({ levelA: 'A1', levelB: 'B1', levelC: 'value-c' });
      await delay();

      expect(node.value?.levelA).toBe('A1');
      expect(node.value?.levelB).toBe('B1');
      expect(node.value?.levelC).toBe('value-c');

      // Change levelA to A2, which should remove levelB by oneOf
      // Note: levelC won't be automatically removed because anyOf conditions
      // are evaluated independently and don't cascade from oneOf removals
      node.setValue({ levelA: 'A2', levelB: 'B1', levelC: 'value-c' });
      await delay();

      expect(node.value?.levelA).toBe('A2');
      expect(node.value?.levelB).toBeUndefined(); // Removed by oneOf
      // levelC remains because anyOf doesn't automatically cascade from levelB removal
      expect(node.value?.levelC).toBe('value-c');

      // To properly remove levelC, explicitly set without it or change its dependency
      node.setValue({ levelA: 'A2' });
      await delay();

      expect(node.value?.levelA).toBe('A2');
      expect(node.value?.levelB).toBeUndefined();
      expect(node.value?.levelC).toBeUndefined(); // Now removed by explicit omission

      // Switch back to A1, set B1 again
      node.setValue({ levelA: 'A1', levelB: 'B1', levelC: 'new-value-c' });
      await delay();

      expect(node.value?.levelA).toBe('A1');
      expect(node.value?.levelB).toBe('B1');
      expect(node.value?.levelC).toBe('new-value-c');

      // Change levelB to B2, which should remove levelC (anyOf condition not met)
      node.setValue({ levelA: 'A1', levelB: 'B2', levelC: 'should-remove' });
      await delay();

      expect(node.value?.levelA).toBe('A1');
      expect(node.value?.levelB).toBe('B2');
      expect(node.value?.levelC).toBeUndefined(); // Removed by anyOf
    });

    it('should handle sync/async timing correctly (immediate vs delayed reads)', async () => {
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
              price: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Test 1: Immediate read after setValue (synchronous UpdateValue)
      node.setValue({ category: 'game', price: 100 });

      // Immediate read - UpdateValue is synchronous after initialization
      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(100);

      // After delay - computed properties updated
      await delay();
      expect(node.value?.category).toBe('game');
      expect(node.value?.price).toBe(100);

      // Test 2: Immediate read after condition change
      node.setValue({ category: 'movie', price: 200 });

      // Immediate read - value is set but oneOf filtering happens asynchronously
      const immediateValue = node.value;
      expect(immediateValue?.category).toBe('movie');
      expect(immediateValue?.price).toBe(200); // Still present immediately

      // After delay - computed properties updated and filtering applied
      await delay();
      const delayedValue = node.value;

      expect(delayedValue?.category).toBe('movie');
      expect(delayedValue?.price).toBeUndefined(); // Price removed by oneOf

      // Test 3: Multiple setValue calls with delay to verify filtering timing
      node.setValue({ category: 'game', price: 300 });
      const value1Immediate = node.value; // Immediate read
      expect(value1Immediate?.category).toBe('game');
      expect(value1Immediate?.price).toBe(300); // Valid for 'game' category

      await delay();
      const value1Delayed = node.value;
      expect(value1Delayed?.category).toBe('game');
      expect(value1Delayed?.price).toBe(300); // Still valid after delay

      // Set invalid combination (movie with price)
      node.setValue({ category: 'movie', price: 400 });
      const value2Immediate = node.value; // Immediate read
      expect(value2Immediate?.category).toBe('movie');
      expect(value2Immediate?.price).toBe(400); // Still present immediately (filtering not applied yet)

      await delay();
      const value2Delayed = node.value;
      expect(value2Delayed?.category).toBe('movie');
      expect(value2Delayed?.price).toBeUndefined(); // NOW filtered out after delay

      // Set valid combination again
      node.setValue({ category: 'game', price: 500 });
      const value3Immediate = node.value; // Immediate read
      expect(value3Immediate?.category).toBe('game');
      expect(value3Immediate?.price).toBe(500); // Valid for 'game' category

      await delay();
      const value3Delayed = node.value;
      expect(value3Delayed?.category).toBe('game');
      expect(value3Delayed?.price).toBe(500); // Still valid after delay
    });
  });
});
