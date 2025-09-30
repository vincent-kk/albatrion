import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

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
});