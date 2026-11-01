import { createRef, useEffect, useLayoutEffect } from 'react';

import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { advanceValidationFrame } from '@/schema-form/__tests__/helpers/advanceValidationFrame';
import { readFieldNodeRuntime } from '@/schema-form/__tests__/helpers/readFieldNodeRuntime';
import { releaseFieldNodeRevealHistory } from '@/schema-form/__tests__/helpers/releaseFieldNodeRevealHistory';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps, FieldRendererProps } from '@/schema-form/types';

import { FieldRendererContextProvider } from '../components/FieldRendererProvider';
import { useErrorVisibility } from '../hooks/useErrorVisibility';
import { useFieldRendererContext } from '../hooks/useFieldRendererContext';

const counter = vi.hoisted(() => ({ calls: 0, displays: 0 }));
vi.mock('../hooks/useFieldRendererContext', async (importOriginal) => {
  const real =
    await importOriginal<typeof import('../hooks/useFieldRendererContext')>();
  return {
    ...real,
    useFieldRendererContext: (
      ...args: Parameters<typeof real.useFieldRendererContext>
    ) => {
      counter.displays++;
      return real.useFieldRendererContext(...args);
    },
  };
});
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
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
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
  counter.displays = 0;
  const root = hydrate ? hydrateRoot(container, form) : createRoot(container);
  if (!hydrate) root.render(form);
  try {
    await settleValidation(() => ref.current?.node);
    const field = ref.current!.node!;
    expect(readFieldNodeRuntime(field).revealReleaseListeners?.size ?? 0).toBe(
      0,
    );
    const afterMountRelease = counter.displays;
    releaseFieldNodeRevealHistory(field);
    await advanceValidationFrame();
    expect(counter.displays).toBe(afterMountRelease);
    expect(container.querySelectorAll('input')).toHaveLength(10);
    // Context reads count display renders and RootNodeContextProvider renders.
    return counter.displays;
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

it('a release before mount passive effects adds no non-candidate display render', async () => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
  const node = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: defaults,
    validationMode: ValidationMode.OnChange,
    deferMountValidation: true,
  });
  const counts = Array.from({ length: 10 }, () => 0);
  let beforeAdvance: number[] = [];
  let finishEffects!: () => void;
  const effectsFlushed = new Promise<void>((resolve) => {
    finishEffects = resolve;
  });
  const Display = ({ index }: { index: number }) => {
    const field = node.find('/field' + index)!;
    const { checkShowError } = useFieldRendererContext();
    useErrorVisibility([field], [checkShowError(field.state)]);
    counts[index]++;
    return null;
  };
  const Parent = () => {
    useLayoutEffect(() => {
      beforeAdvance = [...counts];
      const runtime = readFieldNodeRuntime(node);
      runtime.revealReleaseVersion = (runtime.revealReleaseVersion ?? 0) + 1;
    }, []);
    useEffect(() => {
      finishEffects();
    }, []);
    return (
      <>
        {counts.map((_, index) => (
          <Display key={index} index={index} />
        ))}
      </>
    );
  };
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  counter.calls = 0;
  try {
    flushSync(() =>
      root.render(
        <FieldRendererContextProvider showError={true}>
          <Parent />
        </FieldRendererContextProvider>,
      ),
    );
    await effectsFlushed;
    flushSync(() => undefined);
    expect(beforeAdvance).toEqual(Array.from({ length: 10 }, () => 1));
    expect(counts).toEqual(beforeAdvance);
    expect(counter.calls).toBe(10);
  } finally {
    root.unmount();
    container.remove();
  }
});
