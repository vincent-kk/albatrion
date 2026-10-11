import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { jsx } from 'react/jsx-runtime';
import { jsxDEV } from 'react/jsx-dev-runtime';

import { render } from '@testing-library/react';
import { describe, expect, inject, it, vi } from 'vitest';

import { Form } from '@/schema-form';

declare module 'vitest' {
  export interface ProvidedContext {
    reactMajor: string;
  }
}

describe('REACT-017 runtime compatibility', () => {
  it('68C-10 loads the React version assigned to the render project', () => {
    expect(React.version).toMatch(new RegExp(`^${inject('reactMajor')}\\.`));
    expect(() => jsx('span', { children: React.version })).not.toThrow();
    expect(() => jsxDEV('span', { children: React.version }, undefined, false, undefined, undefined)).not.toThrow();
  });

  it('REACT-017 ERROR-115 ERROR-116 TEST-024 StrictMode mounts without throwing or emitting onChange', () => {
    const onChange = vi.fn();
    const view = render(
      <React.StrictMode>
        <Form jsonSchema={{ type: 'string' }} defaultValue="ready" onChange={onChange} />
      </React.StrictMode>,
    );
    try {
      expect(view.container.querySelector('input')?.value).toBe('ready');
      expect(onChange).not.toHaveBeenCalled();
    } finally {
      view.unmount();
    }
  });

  it('REACT-017 ERROR-115 ERROR-116 TEST-024 renderToString does not throw or emit onChange', () => {
    const onChange = vi.fn();
    expect(() => renderToString(
      <Form jsonSchema={{ type: 'string' }} defaultValue="ready" onChange={onChange} />,
    )).not.toThrow();
    expect(onChange).not.toHaveBeenCalled();
  });
});
