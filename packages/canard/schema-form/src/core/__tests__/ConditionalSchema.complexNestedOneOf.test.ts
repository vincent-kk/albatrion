import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * This test suite covers the ComplexNestedOneOf story scenario
 * Location: packages/canard/schema-form/coverage/17.OneOf.stories.tsx:1374-1568
 *
 * Test focus:
 * 1. Two-level nested oneOf: product.oneOf → shipping.oneOf
 * 2. Data filtering when switching between product types (physical/digital/service)
 * 3. Node.enabled status for form rendering validation
 */
describe('ConditionalSchema - ComplexNestedOneOf story scenario', () => {
  const createComplexNestedOneOfSchema = (): JsonSchema => ({
    type: 'object',
    properties: {
      productType: {
        type: 'string',
        enum: ['physical', 'digital', 'service'],
        default: 'physical',
      },
      product: {
        type: 'object',
        oneOf: [
          {
            computed: {
              if: "../productType === 'physical'",
            },
            properties: {
              name: { type: 'string' },
              weight: { type: 'number', minimum: 0 },
              dimensions: {
                type: 'object',
                properties: {
                  length: { type: 'number', minimum: 0 },
                  width: { type: 'number', minimum: 0 },
                  height: { type: 'number', minimum: 0 },
                },
              },
              shipping: {
                type: 'object',
                properties: {
                  method: {
                    type: 'string',
                    enum: ['standard', 'express'],
                    default: 'standard',
                  },
                },
                oneOf: [
                  {
                    computed: {
                      if: "./method === 'standard'",
                    },
                    properties: {
                      cost: { type: 'number', minimum: 0 },
                      days: { type: 'number', minimum: 1, maximum: 30 },
                    },
                  },
                  {
                    computed: {
                      if: "./method === 'express'",
                    },
                    properties: {
                      cost: { type: 'number', minimum: 10 },
                      hours: { type: 'number', minimum: 1, maximum: 72 },
                    },
                  },
                ],
              },
            },
            required: ['name', 'weight'],
          },
          {
            computed: {
              if: "../productType === 'digital'",
            },
            properties: {
              name: { type: 'string' },
              fileSize: { type: 'number', minimum: 0 },
              format: { type: 'string' },
              downloadLink: { type: 'string', format: 'uri' },
            },
            required: ['name', 'fileSize', 'format'],
          },
          {
            computed: {
              if: "../productType === 'service'",
            },
            properties: {
              name: { type: 'string' },
              duration: { type: 'number', minimum: 0 },
              durationUnit: {
                type: 'string',
                enum: ['hours', 'days', 'months'],
              },
              availability: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ],
                },
              },
            },
            required: ['name', 'duration', 'durationUnit'],
          },
        ],
      },
    },
  });

  describe('Physical Product Button scenario', () => {
    it('should properly set physical product with nested shipping oneOf', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Simulate "Physical Product" button click
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      await delay();

      // Verify value filtering
      expect(node.value?.productType).toBe('physical');
      expect(node.value?.product?.name).toBe('Laptop');
      expect(node.value?.product?.weight).toBe(2.5);
      expect(node.value?.product?.dimensions).toEqual({
        length: 35,
        width: 25,
        height: 2,
      });
      expect(node.value?.product?.shipping?.method).toBe('express');
      expect(node.value?.product?.shipping?.cost).toBe(25);
      expect(node.value?.product?.shipping?.hours).toBe(24);
      expect(node.value?.product?.shipping?.days).toBeUndefined(); // standard field should be filtered

      // Verify node.enabled for rendering (physical product fields should be enabled)
      const productNode = node.find('./product') as ObjectNode;
      const nameNode = productNode.find('./name');
      const weightNode = productNode.find('./weight');
      const dimensionsNode = productNode.find('./dimensions');
      const shippingNode = productNode.find('./shipping') as ObjectNode;

      expect(nameNode?.enabled).toBe(true);
      expect(weightNode?.enabled).toBe(true);
      expect(dimensionsNode?.enabled).toBe(true);
      expect(shippingNode?.enabled).toBe(true);

      // Nested shipping oneOf fields - check children instead of enabled
      const shippingChildren = shippingNode.children?.map(c => c.node.name) ?? [];
      expect(shippingChildren.includes('cost')).toBe(true);
      expect(shippingChildren.includes('hours')).toBe(true);
      expect(shippingChildren.includes('days')).toBe(false); // standard field not in children
    });

    it('should filter out digital/service fields when setting physical product', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set physical product with invalid digital/service fields
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
          // Invalid fields for physical product
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com',
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday'],
        },
      });

      await delay();

      // Digital fields should be filtered out
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.format).toBeUndefined();
      expect(node.value?.product?.downloadLink).toBeUndefined();

      // Service fields should be filtered out
      expect(node.value?.product?.duration).toBeUndefined();
      expect(node.value?.product?.durationUnit).toBeUndefined();
      expect(node.value?.product?.availability).toBeUndefined();

      // Physical fields should be preserved
      expect(node.value?.product?.name).toBe('Laptop');
      expect(node.value?.product?.weight).toBe(2.5);
      expect(node.value?.product?.dimensions).toEqual({
        length: 35,
        width: 25,
        height: 2,
      });
    });
  });

  describe('Digital Product Button scenario', () => {
    it('should properly set digital product and filter out physical/service fields', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Simulate "Digital Product" button click
      node.setValue({
        productType: 'digital',
        product: {
          name: 'Software License',
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com/download',
        },
      });

      await delay();

      // Verify digital fields
      expect(node.value?.productType).toBe('digital');
      expect(node.value?.product?.name).toBe('Software License');
      expect(node.value?.product?.fileSize).toBe(1024);
      expect(node.value?.product?.format).toBe('exe');
      expect(node.value?.product?.downloadLink).toBe(
        'https://example.com/download',
      );

      // Physical fields should be undefined
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.dimensions).toBeUndefined();
      expect(node.value?.product?.shipping).toBeUndefined();

      // Service fields should be undefined
      expect(node.value?.product?.duration).toBeUndefined();
      expect(node.value?.product?.durationUnit).toBeUndefined();
      expect(node.value?.product?.availability).toBeUndefined();

      // Verify node.enabled for rendering
      const productNode = node.find('./product') as ObjectNode;
      const nameNode = productNode.find('./name');
      const fileSizeNode = productNode.find('./fileSize');
      const formatNode = productNode.find('./format');
      const downloadLinkNode = productNode.find('./downloadLink');

      expect(nameNode?.enabled).toBe(true);
      expect(fileSizeNode?.enabled).toBe(true);
      expect(formatNode?.enabled).toBe(true);
      expect(downloadLinkNode?.enabled).toBe(true);

      // Physical/service nodes should not be in children
      const productChildren = productNode.children?.map(c => c.node.name) ?? [];
      expect(productChildren.includes('weight')).toBe(false);
      expect(productChildren.includes('dimensions')).toBe(false);
      expect(productChildren.includes('shipping')).toBe(false);
      expect(productChildren.includes('duration')).toBe(false);
    });

    it('should filter out physical/service fields when setting digital product with mixed data', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set digital product with invalid physical/service fields
      node.setValue({
        productType: 'digital',
        product: {
          name: 'Software License',
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com/download',
          // Invalid fields for digital product
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday'],
        },
      });

      await delay();

      // Physical fields should be filtered out
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.dimensions).toBeUndefined();
      expect(node.value?.product?.shipping).toBeUndefined();

      // Service fields should be filtered out
      expect(node.value?.product?.duration).toBeUndefined();
      expect(node.value?.product?.durationUnit).toBeUndefined();
      expect(node.value?.product?.availability).toBeUndefined();

      // Digital fields should be preserved
      expect(node.value?.product?.name).toBe('Software License');
      expect(node.value?.product?.fileSize).toBe(1024);
      expect(node.value?.product?.format).toBe('exe');
      expect(node.value?.product?.downloadLink).toBe(
        'https://example.com/download',
      );
    });
  });

  describe('Service Product Button scenario', () => {
    it('should properly set service product and filter out physical/digital fields', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Simulate "Service Product" button click
      node.setValue({
        productType: 'service',
        product: {
          name: 'Consulting',
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday', 'wednesday', 'friday'],
        },
      });

      await delay();

      // Verify service fields
      expect(node.value?.productType).toBe('service');
      expect(node.value?.product?.name).toBe('Consulting');
      expect(node.value?.product?.duration).toBe(2);
      expect(node.value?.product?.durationUnit).toBe('hours');
      expect(node.value?.product?.availability).toEqual([
        'monday',
        'wednesday',
        'friday',
      ]);

      // Physical fields should be undefined
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.dimensions).toBeUndefined();
      expect(node.value?.product?.shipping).toBeUndefined();

      // Digital fields should be undefined
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.format).toBeUndefined();
      expect(node.value?.product?.downloadLink).toBeUndefined();

      // Verify node.enabled for rendering
      const productNode = node.find('./product') as ObjectNode;
      const nameNode = productNode.find('./name');
      const durationNode = productNode.find('./duration');
      const durationUnitNode = productNode.find('./durationUnit');
      const availabilityNode = productNode.find('./availability');

      expect(nameNode?.enabled).toBe(true);
      expect(durationNode?.enabled).toBe(true);
      expect(durationUnitNode?.enabled).toBe(true);
      expect(availabilityNode?.enabled).toBe(true);

      // Physical/digital nodes should not be in children
      const productChildren = productNode.children?.map(c => c.node.name) ?? [];
      expect(productChildren.includes('weight')).toBe(false);
      expect(productChildren.includes('dimensions')).toBe(false);
      expect(productChildren.includes('shipping')).toBe(false);
      expect(productChildren.includes('fileSize')).toBe(false);
    });
  });

  describe('Switching between product types', () => {
    it('should properly filter fields when switching from physical to digital', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Start with physical product
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      await delay();

      expect(node.value?.product?.weight).toBe(2.5);
      expect(node.value?.product?.shipping).toBeDefined();

      // Switch to digital product
      node.setValue({
        productType: 'digital',
        product: {
          name: 'Software License',
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com/download',
        },
      });

      await delay();

      // Physical fields should be removed
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.dimensions).toBeUndefined();
      expect(node.value?.product?.shipping).toBeUndefined();

      // Digital fields should be present
      expect(node.value?.product?.fileSize).toBe(1024);
      expect(node.value?.product?.format).toBe('exe');
      expect(node.value?.product?.downloadLink).toBe(
        'https://example.com/download',
      );
    });

    it('should properly filter fields when switching from digital to service', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Start with digital product
      node.setValue({
        productType: 'digital',
        product: {
          name: 'Software License',
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com/download',
        },
      });

      await delay();

      expect(node.value?.product?.fileSize).toBe(1024);
      expect(node.value?.product?.format).toBe('exe');

      // Switch to service product
      node.setValue({
        productType: 'service',
        product: {
          name: 'Consulting',
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday', 'wednesday', 'friday'],
        },
      });

      await delay();

      // Digital fields should be removed
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.format).toBeUndefined();
      expect(node.value?.product?.downloadLink).toBeUndefined();

      // Service fields should be present
      expect(node.value?.product?.duration).toBe(2);
      expect(node.value?.product?.durationUnit).toBe('hours');
      expect(node.value?.product?.availability).toEqual([
        'monday',
        'wednesday',
        'friday',
      ]);
    });

    it('should properly filter fields when switching from service to physical', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Start with service product
      node.setValue({
        productType: 'service',
        product: {
          name: 'Consulting',
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday', 'wednesday', 'friday'],
        },
      });

      await delay();

      expect(node.value?.product?.duration).toBe(2);
      expect(node.value?.product?.availability).toBeDefined();

      // Switch to physical product
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      await delay();

      // Service fields should be removed
      expect(node.value?.product?.duration).toBeUndefined();
      expect(node.value?.product?.durationUnit).toBeUndefined();
      expect(node.value?.product?.availability).toBeUndefined();

      // Physical fields should be present
      expect(node.value?.product?.weight).toBe(2.5);
      expect(node.value?.product?.dimensions).toEqual({
        length: 35,
        width: 25,
        height: 2,
      });
      expect(node.value?.product?.shipping).toBeDefined();
    });
  });

  describe('Nested shipping oneOf within physical product', () => {
    it('should properly handle nested shipping oneOf - standard method', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set physical product with standard shipping
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'standard', cost: 10, days: 5 },
        },
      });

      await delay();

      // Standard shipping fields should be present
      expect(node.value?.product?.shipping?.method).toBe('standard');
      expect(node.value?.product?.shipping?.cost).toBe(10);
      expect(node.value?.product?.shipping?.days).toBe(5);

      // Express shipping fields should be undefined
      expect(node.value?.product?.shipping?.hours).toBeUndefined();

      // Verify node.enabled
      const productNode = node.find('./product') as ObjectNode;
      const shippingNode = productNode.find('./shipping') as ObjectNode;
      // Check shipping children for standard method
      const shippingChildren = shippingNode.children?.map(c => c.node.name) ?? [];
      expect(shippingChildren.includes('cost')).toBe(true);
      expect(shippingChildren.includes('days')).toBe(true);
      expect(shippingChildren.includes('hours')).toBe(false);
    });

    it('should properly handle nested shipping oneOf - express method', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set physical product with express shipping
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      await delay();

      // Express shipping fields should be present
      expect(node.value?.product?.shipping?.method).toBe('express');
      expect(node.value?.product?.shipping?.cost).toBe(25);
      expect(node.value?.product?.shipping?.hours).toBe(24);

      // Standard shipping fields should be undefined
      expect(node.value?.product?.shipping?.days).toBeUndefined();

      // Verify node.enabled
      const productNode = node.find('./product') as ObjectNode;
      const shippingNode = productNode.find('./shipping') as ObjectNode;
      // Check shipping children for express method
      const shippingChildren = shippingNode.children?.map(c => c.node.name) ?? [];
      expect(shippingChildren.includes('cost')).toBe(true);
      expect(shippingChildren.includes('hours')).toBe(true);
      expect(shippingChildren.includes('days')).toBe(false);
    });

    it('should filter shipping fields when switching between standard and express', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Start with standard shipping
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'standard', cost: 10, days: 5 },
        },
      });

      await delay();

      expect(node.value?.product?.shipping?.days).toBe(5);
      expect(node.value?.product?.shipping?.hours).toBeUndefined();

      // Switch to express shipping
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      await delay();

      // Standard fields should be removed, express fields should be present
      expect(node.value?.product?.shipping?.days).toBeUndefined();
      expect(node.value?.product?.shipping?.hours).toBe(24);
    });

    it('should filter nested shipping fields when setting with mixed data', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set standard shipping with both standard and express fields
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: {
            method: 'standard',
            cost: 10,
            days: 5,
            hours: 24, // Invalid for standard
          },
        },
      });

      await delay();

      // Only standard fields should be present
      expect(node.value?.product?.shipping?.method).toBe('standard');
      expect(node.value?.product?.shipping?.cost).toBe(10);
      expect(node.value?.product?.shipping?.days).toBe(5);
      expect(node.value?.product?.shipping?.hours).toBeUndefined();

      // Set express shipping with both standard and express fields
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: {
            method: 'express',
            cost: 25,
            days: 5, // Invalid for express
            hours: 24,
          },
        },
      });

      await delay();

      // Only express fields should be present
      expect(node.value?.product?.shipping?.method).toBe('express');
      expect(node.value?.product?.shipping?.cost).toBe(25);
      expect(node.value?.product?.shipping?.days).toBeUndefined();
      expect(node.value?.product?.shipping?.hours).toBe(24);
    });
  });

  describe('Edge cases - timing and consistency', () => {
    it('should handle rapid button clicks correctly', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Rapid button clicks: physical → digital → service
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          shipping: { method: 'express', cost: 25, hours: 24 },
        },
      });

      node.setValue({
        productType: 'digital',
        product: {
          name: 'Software License',
          fileSize: 1024,
          format: 'exe',
          downloadLink: 'https://example.com/download',
        },
      });

      node.setValue({
        productType: 'service',
        product: {
          name: 'Consulting',
          duration: 2,
          durationUnit: 'hours',
          availability: ['monday', 'wednesday', 'friday'],
        },
      });

      await delay();

      // Final state should be service product
      expect(node.value?.productType).toBe('service');
      expect(node.value?.product?.name).toBe('Consulting');
      expect(node.value?.product?.duration).toBe(2);
      expect(node.value?.product?.durationUnit).toBe('hours');

      // Physical/digital fields should be undefined
      expect(node.value?.product?.weight).toBeUndefined();
      expect(node.value?.product?.shipping).toBeUndefined();
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.format).toBeUndefined();
    });

    it('should maintain consistency when setting incomplete data', async () => {
      const schema = createComplexNestedOneOfSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set physical product with partial data (missing shipping)
      node.setValue({
        productType: 'physical',
        product: {
          name: 'Laptop',
          weight: 2.5,
          // dimensions and shipping missing
        },
      });

      await delay();

      expect(node.value?.productType).toBe('physical');
      expect(node.value?.product?.name).toBe('Laptop');
      expect(node.value?.product?.weight).toBe(2.5);
      expect(node.value?.product?.dimensions).toBeUndefined();

      // shipping should have default method='standard' even though not explicitly provided
      expect(node.value?.product?.shipping).toEqual({ method: 'standard' });

      // Digital/service fields should still be undefined
      expect(node.value?.product?.fileSize).toBeUndefined();
      expect(node.value?.product?.duration).toBeUndefined();
    });
  });
});