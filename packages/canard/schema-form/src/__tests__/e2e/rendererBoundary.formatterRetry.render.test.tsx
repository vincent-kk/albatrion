import { useState } from 'react';

import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { type FieldRendererProps, Form, ValidationMode } from '../../index';

const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;

it('reports a renderer once when the error callback rerenders an inline formatter', () => {
  const report = vi.fn();
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
  const BrokenRenderer = ({ Input, path }: FieldRendererProps) => {
    if (path === '/a') throw new Error('broken renderer');
    return <Input />;
  };
  const App = () => {
    const [, setCount] = useState(0);
    return (
      <Form
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        FieldRenderer={BrokenRenderer}
        formatError={(error) => error.message ?? null}
        onError={(record) => {
          report(record);
          setCount((count) => count + 1);
        }}
      />
    );
  };
  try {
    const view = render(<App />);
    expect(view.container.querySelector('input[name="b"]')).not.toBeNull();
    expect(report).toHaveBeenCalledTimes(1);
  } finally {
    errorLog.mockRestore();
  }
});
