import React, { useState } from 'react';
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Full Name' },
    email: { type: 'string', title: 'Email' },
    age: { type: 'integer', title: 'Age', minimum: 0, maximum: 150 },
    bio: { type: 'string', title: 'About You', format: 'textarea' },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      formType: 'switch',
    },
  },
  required: ['name', 'email'],
};

export default function UserProfileDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        padding: 24,
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <Form jsonSchema={schema as any} onChange={setValues} />
      <details style={{ marginTop: 16 }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          Form values
        </summary>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 6,
            background: 'var(--ifm-color-emphasis-100)',
            fontSize: 12,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(values, null, 2)}
        </pre>
      </details>
      <details style={{ marginTop: 8 }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          View JSON Schema
        </summary>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 6,
            background: 'var(--ifm-color-emphasis-100)',
            fontSize: 12,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(schema, null, 2)}
        </pre>
      </details>
    </div>
  );
}
