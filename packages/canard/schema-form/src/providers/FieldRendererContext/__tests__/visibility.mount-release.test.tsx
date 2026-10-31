import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { FieldInputProps, FieldRendererProps } from '@/schema-form/types';

const counter = vi.hoisted(() => ({ calls: 0 }));
vi.mock('../hooks/useErrorVisibility', async (importOriginal) => {
  const real =
    await importOriginal<typeof import('../hooks/useErrorVisibility')>();
  return {
    ...real,
    useErrorVisibility: (
      ...args: Parameters<typeof real.useErrorVisibility>
    ) => {
      counter.calls++;
      return real.useErrorVisibility(...args);
    },
  };
});

const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
afterEach(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});
const schema = {
  type: 'object' as const,
  properties: Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => [
      'field' + index,
      { type: 'string' as const },
    ]),
  ),
};
const defaults = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => ['field' + index, 'v']),
);
const Text = ({ value }: FieldInputProps) => (
  <input value={value ?? ''} readOnly />
);
const Branch = ({ ChildFields }: FieldInputProps) => (
  <>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
  </>
);
const Renderer = ({ Input }: FieldRendererProps) => <Input />;
const validator = {
  compileGuard: () => () => true,
  compile: () => () => [],
};
const countMount = async (hydrate: boolean, showError: boolean) => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
  const container = document.createElement('div');
  document.body.append(container);
  const form = (
    <Form
      jsonSchema={schema}
      defaultValue={defaults}
      showError={showError}
      validatorFactory={validator}
      FieldRenderer={Renderer}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: { type: 'string' }, Component: Text },
      ]}
    />
  );
  if (hydrate) container.innerHTML = renderToString(form);
  counter.calls = 0;
  const root = hydrate ? hydrateRoot(container, form) : createRoot(container);
  if (!hydrate) root.render(form);
  try {
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container.querySelectorAll('input')).toHaveLength(10);
    return counter.calls;
  } finally {
    root.unmount();
    container.remove();
  }
};
it.each([false, true])(
  'non-candidate mount release adds no display render (hydrate=%s)',
  async (hydrate) => {
    const hidden = await countMount(hydrate, false);
    const always = await countMount(hydrate, true);
    console.info('IR6_MOUNT_RELEASE_COUNTS', { hydrate, hidden, always });
    expect(hidden).toBeGreaterThan(0);
    expect(always).toBe(hidden);
  },
);
