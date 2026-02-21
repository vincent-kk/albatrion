import React, { useState } from 'react';
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';
import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    price: {
      type: 'number',
      title: 'Unit Price',
      default: 10000,
      description: 'Price per item in currency units',
    },
    quantity: {
      type: 'number',
      title: 'Quantity',
      default: 2,
      minimum: 1,
      description: 'Number of items to purchase',
    },
    taxRate: {
      type: 'number',
      title: 'Tax Rate (%)',
      default: 10,
      minimum: 0,
      maximum: 100,
      description: 'Tax percentage applied to subtotal',
    },
    discountRate: {
      type: 'number',
      title: 'Discount Rate (%)',
      default: 5,
      minimum: 0,
      maximum: 100,
      description: 'Discount percentage applied after tax',
    },
    finalPrice: {
      type: 'number',
      title: 'Final Price',
      description: 'Auto-calculated: Price × Quantity × (1 + Tax%) × (1 − Discount%)',
      computed: {
        derived: '../price * ../quantity * (1 + ../taxRate / 100) * (1 - ../discountRate / 100)',
      },
    },
  },
};

export default function AutoCalculationDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
