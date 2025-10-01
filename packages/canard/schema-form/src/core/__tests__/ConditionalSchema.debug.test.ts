import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import { NodeEventType } from '@/schema-form/core/nodes/type';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

describe('Debug - Nested oneOf setValue behavior', () => {
  it('should debug dimensions setValue', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        productType: {
          type: 'string',
          enum: ['physical', 'digital'],
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
                dimensions: {
                  type: 'object',
                  properties: {
                    length: { type: 'number' },
                  },
                },
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

    console.log('\\n=== BEFORE setValue ===');
    const productNode = node.find('./product') as ObjectNode;
    console.log('product.oneOfIndex:', productNode.oneOfIndex);
    console.log(
      'product.children:',
      productNode.children?.map((c) => c.node.name),
    );

    // Access strategy to debug - use Object.getOwnPropertyNames to find private fields
    const strategyProps = Object.getOwnPropertyNames(
      Object.getPrototypeOf(productNode),
    ).filter((p) => p.includes('strategy'));
    console.log('Available strategy props:', strategyProps);

    // Try to access through the internal property
    const internalProps = Object.getOwnPropertySymbols(productNode);
    console.log(
      'Symbol properties:',
      internalProps.map((s) => s.toString()),
    );

    // Check if product has oneOf schema
    console.log(
      'product.jsonSchema.oneOf:',
      productNode.jsonSchema.oneOf?.length || 'none',
    );

    // Subscribe to product node events to track what happens
    productNode.subscribe((event) => {
      console.log(
        `[productNode Event] type:`,
        NodeEventType[event.type] || event.type,
        'payload:',
        event.payload,
      );
    });

    const dimensionsNode = productNode.find(
      './dimensions',
    ) as ObjectNode | null;
    if (dimensionsNode) {
      dimensionsNode.subscribe((event) => {
        console.log(
          `[dimensionsNode Event] type:`,
          NodeEventType[event.type] || event.type,
          'value:',
          dimensionsNode.value,
        );
      });
    }

    node.setValue({
      productType: 'physical',
      product: {
        name: 'Test',
        dimensions: { length: 35 },
      },
    });

    console.log('\\n=== AFTER setValue (sync) ===');
    console.log('product.value:', JSON.stringify(productNode.value));
    console.log('product.oneOfIndex:', productNode.oneOfIndex);
    console.log(
      'product.children:',
      productNode.children?.map((c) => c.node.name),
    );

    const dimensionsNodeBefore = productNode.find('./dimensions');
    console.log('dimensions node exists:', !!dimensionsNodeBefore);
    if (dimensionsNodeBefore) {
      console.log('dimensions.value:', dimensionsNodeBefore.value);
      console.log('dimensions.enabled:', dimensionsNodeBefore.enabled);
      console.log('dimensions.active:', dimensionsNodeBefore.active);
    }

    await delay();

    console.log('\\n=== AFTER delay ===');
    console.log('product.value:', JSON.stringify(productNode.value));
    console.log('product.oneOfIndex:', productNode.oneOfIndex);
    console.log(
      'product.children:',
      productNode.children?.map((c) => c.node.name),
    );

    const dimensionsNodeAfter = productNode.find('./dimensions');
    console.log('dimensions node exists:', !!dimensionsNodeAfter);
    if (dimensionsNodeAfter) {
      console.log('dimensions.value:', dimensionsNodeAfter.value);
      console.log('dimensions.enabled:', dimensionsNodeAfter.enabled);
      console.log('dimensions.active:', dimensionsNodeAfter.active);
    }

    expect(node.value?.product?.dimensions).toEqual({ length: 35 });
  });
});
