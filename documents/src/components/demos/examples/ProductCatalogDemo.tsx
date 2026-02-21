import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    productType: {
      type: 'string',
      title: 'Product Type',
      enum: ['physical', 'digital', 'service'],
      default: 'physical',
      description: 'Each type shows different detail fields',
    },
    product: {
      type: 'object',
      title: 'Product Details',
      oneOf: [
        {
          computed: { if: "../productType === 'physical'" },
          properties: {
            name: {
              type: 'string',
              title: 'Product Name',
              placeholder: 'e.g. Wireless Headphones',
              default: 'Wireless Headphones',
            },
            weight: {
              type: 'number',
              title: 'Weight (kg)',
              minimum: 0,
              default: 0.25,
              description: 'Product weight for shipping calculation',
            },
            dimensions: {
              type: 'object',
              title: 'Dimensions',
              properties: {
                length: {
                  type: 'number',
                  title: 'Length (cm)',
                  minimum: 0,
                  default: 20,
                },
                width: {
                  type: 'number',
                  title: 'Width (cm)',
                  minimum: 0,
                  default: 15,
                },
                height: {
                  type: 'number',
                  title: 'Height (cm)',
                  minimum: 0,
                  default: 8,
                },
              },
            },
            shipping: {
              type: 'object',
              title: 'Shipping',
              properties: {
                method: {
                  type: 'string',
                  title: 'Shipping Method',
                  enum: ['standard', 'express'],
                  default: 'standard',
                },
              },
              oneOf: [
                {
                  computed: { if: "./method === 'standard'" },
                  properties: {
                    cost: {
                      type: 'number',
                      title: 'Cost ($)',
                      minimum: 0,
                      default: 5.99,
                    },
                    days: {
                      type: 'number',
                      title: 'Delivery Days',
                      minimum: 1,
                      maximum: 30,
                      default: 7,
                    },
                  },
                },
                {
                  computed: { if: "./method === 'express'" },
                  properties: {
                    cost: {
                      type: 'number',
                      title: 'Cost ($)',
                      minimum: 10,
                      default: 15.99,
                    },
                    hours: {
                      type: 'number',
                      title: 'Delivery Hours',
                      minimum: 1,
                      maximum: 72,
                      default: 24,
                    },
                  },
                },
              ],
            },
          },
          required: ['name', 'weight'],
        },
        {
          computed: { if: "../productType === 'digital'" },
          properties: {
            name: {
              type: 'string',
              title: 'Product Name',
              placeholder: 'e.g. Design Templates Pack',
              default: 'Design Templates Pack',
            },
            fileSize: {
              type: 'number',
              title: 'File Size (MB)',
              minimum: 0,
              default: 256,
              description: 'Total download size in megabytes',
            },
            format: {
              type: 'string',
              title: 'Format',
              default: 'ZIP',
              placeholder: 'e.g. ZIP, PDF, MP4',
            },
            downloadLink: {
              type: 'string',
              title: 'Download Link',
              format: 'uri',
              placeholder: 'https://example.com/download',
            },
          },
          required: ['name', 'fileSize', 'format'],
        },
        {
          computed: { if: "../productType === 'service'" },
          properties: {
            name: {
              type: 'string',
              title: 'Service Name',
              placeholder: 'e.g. Web Development Consulting',
              default: 'Web Development Consulting',
            },
            duration: {
              type: 'number',
              title: 'Duration',
              minimum: 0,
              default: 3,
              description: 'Length of service engagement',
            },
            durationUnit: {
              type: 'string',
              title: 'Duration Unit',
              enum: ['hours', 'days', 'months'],
              default: 'months',
            },
            availability: {
              type: 'array',
              title: 'Available Days',
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
              default: ['monday', 'wednesday', 'friday'],
            },
          },
          required: ['name', 'duration', 'durationUnit'],
        },
      ],
    },
  },
};

export default function ProductCatalogDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
