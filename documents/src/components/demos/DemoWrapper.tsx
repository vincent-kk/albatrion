import React from 'react';

interface DemoWrapperProps {
  schema: object;
  values: unknown;
  children: React.ReactNode;
}

export default function DemoWrapper({ schema, values, children }: DemoWrapperProps) {
  return (
    <div
      className="demo-form"
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        padding: 24,
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <style>{`
        .demo-form .ant-select {
          min-width: 200px !important;
        }
        .demo-form .ant-select-selector {
          min-width: 200px !important;
        }
        .demo-form .ant-input-number {
          min-width: 120px !important;
        }
      `}</style>
      {children}
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
