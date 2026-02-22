import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    accountType: {
      type: 'string',
      title: 'Account Type',
      enum: ['personal', 'business'],
      default: 'personal',
      description: 'Business accounts require additional company details',
    },
    subscriptionPlan: {
      type: 'string',
      title: 'Subscription Plan',
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
      description: 'Premium and Enterprise plans require billing info',
    },
    paymentMethod: {
      type: 'string',
      title: 'Payment Method',
      enum: ['card', 'invoice'],
      default: 'card',
      description: 'Invoice payment requires additional documents',
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
      placeholder: 'e.g. billing@company.com',
    },
    companyName: {
      type: 'string',
      title: 'Company Name',
      placeholder: 'e.g. Acme Corporation',
    },
    businessNumber: {
      type: 'string',
      title: 'Business Number',
      pattern: '^[0-9]{10}$',
      placeholder: 'e.g. 1234567890',
      description: 'Format: 10-digit business registration number',
    },
    billingAddress: {
      type: 'string',
      title: 'Billing Address',
      placeholder: 'e.g. 123 Main St, City',
    },
    purchaseOrder: {
      type: 'string',
      title: 'Purchase Order',
      placeholder: 'e.g. PO-2024-001',
      description: 'Required for invoice payment method',
    },
    taxDocument: {
      type: 'string',
      title: 'Tax Document',
      placeholder: 'e.g. Tax invoice reference',
      description: 'Required for business invoice payments',
    },
  },
  if: {
    properties: {
      accountType: { const: 'business' },
      paymentMethod: { const: 'invoice' },
    },
  },
  then: {
    required: [
      'email',
      'companyName',
      'businessNumber',
      'billingAddress',
      'purchaseOrder',
      'taxDocument',
    ],
  },
  else: {
    if: {
      properties: {
        accountType: { const: 'business' },
        paymentMethod: { const: 'card' },
      },
    },
    then: {
      required: ['email', 'companyName', 'businessNumber', 'billingAddress'],
    },
    else: {
      if: {
        properties: {
          accountType: { const: 'personal' },
          subscriptionPlan: { enum: ['premium', 'enterprise'] },
        },
      },
      then: {
        required: ['email', 'billingAddress'],
      },
      else: {
        required: ['email'],
      },
    },
  },
  required: ['accountType', 'subscriptionPlan', 'paymentMethod'],
};

export default function DynamicBillingDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
