import React, { useState } from 'react';
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    general: {
      type: 'object',
      title: 'General',
      properties: {
        displayName: { type: 'string', title: 'Display Name' },
        language: {
          type: 'string',
          title: 'Language',
          enum: ['English', '한국어', '日本語', '中文'],
        },
        theme: {
          type: 'string',
          title: 'Theme',
          enum: ['Light', 'Dark'],
          formType: 'switch',
        },
      },
    },
    notifications: {
      type: 'object',
      title: 'Notifications',
      properties: {
        emailNotif: {
          type: 'boolean',
          title: 'Email Notifications',
          formType: 'switch',
        },
        pushNotif: {
          type: 'boolean',
          title: 'Push Notifications',
          formType: 'switch',
        },
        frequency: {
          type: 'string',
          title: 'Digest Frequency',
          enum: ['Immediate', 'Daily', 'Weekly'],
          formType: 'radio',
        },
      },
    },
    privacy: {
      type: 'object',
      title: 'Privacy',
      properties: {
        profileVisibility: {
          type: 'boolean',
          title: 'Public Profile',
          formType: 'switch',
        },
        activityTracking: { type: 'boolean', title: 'Activity Tracking' },
      },
    },
  },
};

export default function NestedSettingsDemo() {
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
