import { createRef } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { InputRendererProps } from '@/schema-form/types';

afterEach(() => vi.unstubAllGlobals());

it('renders a write followed by error-only delivery in the same task only twice', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
  const ref = createRef<FormHandle>();
  const frames = vi.fn(({ children }: InputRendererProps) => (
    <section>{children}</section>
  ));
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    flushSync(() =>
      root.render(
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: { field: { type: 'string' } },
          }}
          defaultValue={{ field: 'initial' }}
          InputRenderer={frames}
          validationMode={0}
        />,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
    const node = ref.current!.findNode('/field')!;
    frames.mockClear();

    node.setValue('next');
    node.setExternalErrors([{ dataPath: '/field', message: 'bad' }]);
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(container.querySelector('input')?.value).toBe('next');
    expect(frames).toHaveBeenCalledTimes(2);
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
});
