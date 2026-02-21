import React, { useState } from 'react';
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';
import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      placeholder: 'e.g. John Doe',
      default: 'Jane Smith',
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
      placeholder: 'e.g. jane@example.com',
    },
    age: {
      type: 'integer',
      title: 'Age',
      minimum: 0,
      maximum: 150,
      default: 28,
      description: 'Must be between 0 and 150',
    },
    birthday: {
      type: 'string',
      title: 'Birthday',
      format: 'date',
    },
    role: {
      type: 'string',
      title: 'Role',
      enum: ['developer', 'designer', 'manager', 'other'],
      default: 'developer',
      description: 'Select your primary role in the team',
    },
    bio: {
      type: 'string',
      title: 'About You',
      format: 'textarea',
      placeholder: 'Tell us about yourself...',
    },
    active: {
      type: 'boolean',
      title: 'Active Status',
      formType: 'switch',
      default: true,
      description: 'Toggle your active status',
    },
  },
  required: ['name', 'email'],
};

export default function BasicFormDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
