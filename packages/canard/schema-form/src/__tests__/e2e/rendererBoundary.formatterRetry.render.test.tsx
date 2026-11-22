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

it('retries a failed renderer for one formatter replacement and then keeps its fallback', () => {
  const report = vi.fn();
  const fail = vi.fn(() => {
    throw new Error('persistent renderer failure');
  });
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
  const Renderer = ({ Input, path }: FieldRendererProps) => {
    if (path === '/a') fail();
    return <Input />;
  };
  const form = (formatError: FieldRendererProps['formatError']) => (
    <Form
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      FieldRenderer={Renderer}
      formatError={formatError}
      onError={report}
    />
  );

  try {
    const view = render(form(() => 'first'));
    const initial = fail.mock.calls.length;
    expect(initial).toBeGreaterThan(0);
    view.rerender(form(() => 'second'));
    const retried = fail.mock.calls.length;
    expect(retried).toBeGreaterThan(initial);
    view.rerender(form(() => 'third'));
    expect(fail).toHaveBeenCalledTimes(retried);
    expect(report).toHaveBeenCalledTimes(1);
    expect(view.container.querySelector('input[name="a"]')).toBeNull();
    expect(view.container.querySelector('input[name="b"]')).not.toBeNull();
  } finally {
    errorLog.mockRestore();
  }
});
