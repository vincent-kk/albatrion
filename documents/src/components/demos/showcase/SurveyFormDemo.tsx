import React, { useState } from 'react';
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    satisfaction: {
      type: 'string',
      title: 'Overall Satisfaction',
      enum: [
        'Very Satisfied',
        'Satisfied',
        'Neutral',
        'Dissatisfied',
        'Very Dissatisfied',
      ],
      formType: 'radio',
    },
    features: {
      type: 'array',
      title: 'Favorite Features',
      formType: 'checkbox',
      items: {
        type: 'string',
        enum: ['Performance', 'Design', 'Reliability', 'Price', 'Support'],
      },
    },
    npsScore: {
      type: 'integer',
      title: 'NPS Score (0–10)',
      formType: 'slider',
      minimum: 0,
      maximum: 10,
    },
    visitDate: { type: 'string', title: 'Visit Date', format: 'date' },
    feedback: {
      type: 'string',
      title: 'Additional Feedback',
      format: 'textarea',
    },
  },
};

export default function SurveyFormDemo() {
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
