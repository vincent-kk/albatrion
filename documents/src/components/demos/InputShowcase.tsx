import React, { useState, useCallback } from 'react';
import { Form } from '@canard/schema-form';

interface InputShowcaseProps {
  name: string;
  trigger: string;
  schema: Record<string, unknown>;
}

export default function InputShowcase({ name, trigger, schema }: InputShowcaseProps) {
  const [value, setValue] = useState<unknown>(undefined);

  const formSchema = {
    type: 'object',
    properties: { field: schema },
  };

  const handleChange = useCallback((v: unknown) => {
    setValue((v as any)?.field);
  }, []);

  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <code style={{ fontWeight: 600, fontSize: 13 }}>{name}</code>
        <span
          style={{
            fontSize: 11,
            color: 'var(--ifm-color-emphasis-600)',
            background: 'var(--ifm-color-emphasis-100)',
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: 'var(--ifm-font-family-monospace)',
          }}
        >
          {trigger}
        </span>
      </div>
      <Form jsonSchema={formSchema as any} onChange={handleChange} />
      <div
        style={{
          marginTop: 8,
          padding: '4px 8px',
          fontSize: 12,
          color: 'var(--ifm-color-emphasis-600)',
          fontFamily: 'var(--ifm-font-family-monospace)',
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: 4,
          wordBreak: 'break-all',
        }}
      >
        {JSON.stringify(value) ?? 'undefined'}
      </div>
    </div>
  );
}
