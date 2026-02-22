import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      title: 'User',
      description: 'Basic user information and profile settings',
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          maxLength: 50,
          default: 'Jane Smith',
          placeholder: 'e.g. Jane Smith',
        },
        email: {
          type: 'string',
          title: 'Email',
          format: 'email',
          placeholder: 'e.g. jane@example.com',
        },
        profile: {
          type: 'object',
          title: 'Profile',
          description: 'Detailed profile with conditional required fields',
          if: {
            properties: { type: { enum: ['adult', 'child'] } },
          },
          then: {
            required: ['age', 'gender', 'preferences'],
          },
          properties: {
            type: {
              type: 'string',
              title: 'Profile Type',
              enum: ['adult', 'child', 'none'],
              default: 'adult',
              description:
                'Selecting adult/child enables additional required fields',
            },
            age: { type: 'integer', title: 'Age', minimum: 0, default: 28 },
            gender: {
              type: 'string',
              title: 'Gender',
              enum: ['male', 'female', 'other'],
              default: 'female',
              description: 'Active only when age >= 18',
              computed: { active: '../age >= 18' },
            },
            preferences: {
              type: 'object',
              title: 'Preferences',
              description: 'UI and notification preferences',
              properties: {
                theme: {
                  type: 'string',
                  title: 'Theme',
                  enum: ['light', 'dark'],
                  default: 'dark',
                },
                notifications: {
                  type: 'object',
                  title: 'Notifications',
                  description: 'Notification channel preferences',
                  properties: {
                    email: {
                      type: 'boolean',
                      title: 'Email Notifications',
                      default: true,
                    },
                    sms: {
                      type: 'boolean',
                      title: 'SMS Notifications',
                      default: false,
                    },
                  },
                  required: ['email', 'sms'],
                },
              },
              required: ['theme', 'notifications'],
            },
          },
          required: ['type'],
        },
      },
      required: ['name'],
    },
    settings: {
      type: 'object',
      title: 'Settings',
      description: 'Application and security settings',
      properties: {
        privacy: {
          type: 'string',
          title: 'Privacy',
          oneOf: [
            { const: 'public', title: 'Public' },
            { const: 'private', title: 'Private' },
            { const: 'custom', title: 'Custom' },
          ],
          default: 'public',
          description: 'Who can see your profile',
        },
        language: {
          type: 'string',
          title: 'Language',
          enum: ['en', 'kr', 'jp'],
          default: 'en',
        },
        security: {
          type: 'object',
          title: 'Security',
          description: 'Two-factor auth and backup codes',
          properties: {
            '2FA': {
              type: 'boolean',
              title: 'Two-Factor Authentication',
              default: true,
            },
            backupCodes: {
              type: 'array',
              title: 'Backup Codes',
              description: 'Emergency recovery codes (8-char alphanumeric)',
              items: { type: 'string', pattern: '^[A-Z0-9]{8}$' },
              minItems: 5,
              maxItems: 10,
            },
          },
          required: ['2FA'],
        },
      },
      required: ['privacy', 'language'],
    },
  },
  required: ['user', 'settings'],
};

export default function NestedProfileDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}
