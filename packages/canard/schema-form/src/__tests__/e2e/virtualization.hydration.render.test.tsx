import {
  type ReactElement,
  StrictMode,
  Suspense,
  createRef,
  useLayoutEffect,
} from 'react';

import { act } from '@testing-library/react';
import { type Root, createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  VirtualizationBackfill,
} from '@/schema-form';

const flatSchema: JSONSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [
      `field_${index}`,
      { type: 'string', default: `value_${index}` },
    ]),
  ),
};

const virtualization = {
  threshold: 30,
  eagerCount: 20,
  backfill: VirtualizationBackfill.None,
};

/** Browser observer stays idle so hydration cannot accidentally reveal placeholders. */
class IdleObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let suspenseProbeCommits = 0;

/** A hydrated boundary must commit its descendants rather than remain server-only. */
const Probe = () => {
  useLayoutEffect(() => {
    suspenseProbeCommits++;
  }, []);
  return null;
};

/** Custom branch inputs can place their child proxies inside a dehydrated boundary. */
const SuspendedBranch = ({ ChildFields }: FieldInputProps) => (
  <Suspense fallback={<span>Loading</span>}>
    <Probe />
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
  </Suspense>
);

describe('virtualization across server rendering and client hydration', () => {
  let container: HTMLDivElement;
  let root: Root | undefined;
  let recoverableErrors: string[];
  let consoleErrors: string[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    suspenseProbeCommits = 0;
    recoverableErrors = [];
    consoleErrors = [];
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(
        args.map((arg) => String(arg).split('\n')[0]).join(' '),
      );
    });
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('preserves server inputs without hydration errors when virtualization is off', async () => {
    const form = (
      <Form
        jsonSchema={{
          type: 'object',
          properties: Object.fromEntries(
            Array.from({ length: 40 }, (_, index) => [
              `field_${index}`,
              { type: 'string', default: `value_${index}` },
            ]),
          ),
        }}
        validationMode={ValidationMode.None}
      />
    );
    container.innerHTML = renderToString(form);
    consoleErrors.length = 0;
    const serverInputs = [...container.querySelectorAll('input')];
    expect(serverInputs).toHaveLength(40);
    vi.stubGlobal('IntersectionObserver', vi.fn());

    await act(async () => {
      root = hydrateRoot(container, form, {
        onRecoverableError: (error) =>
          recoverableErrors.push(String(error).split('\n')[0]),
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    const hydratedInputs = [...container.querySelectorAll('input')];
    expect(hydratedInputs).toHaveLength(40);
    hydratedInputs.forEach((input, index) => {
      expect(input).toBe(serverInputs[index]);
      expect(input.value).toBe(`value_${index}`);
    });
  });

  it('preserves server inputs without hydration mismatch when an IO-enabled client gates a branch at threshold', async () => {
    const form = (
      <Form
        jsonSchema={{
          type: 'object',
          properties: Object.fromEntries(
            Array.from({ length: 40 }, (_, index) => [
              `field_${index}`,
              { type: 'string', default: `value_${index}` },
            ]),
          ),
        }}
        validationMode={ValidationMode.None}
        virtualization={{
          threshold: 30,
          eagerCount: 20,
          backfill: VirtualizationBackfill.None,
        }}
      />
    );
    container.innerHTML = renderToString(form);
    consoleErrors.length = 0;
    const serverInputs = [...container.querySelectorAll('input')];
    expect(serverInputs).toHaveLength(40);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

    await act(async () => {
      root = hydrateRoot(container, form, {
        onRecoverableError: (error) =>
          recoverableErrors.push(String(error).split('\n')[0]),
      });
    });

    const hydratedInputs = [...container.querySelectorAll('input')];
    const diagnostics = JSON.stringify({
      recoverableErrors,
      consoleErrors,
      inputs: hydratedInputs.length,
      placeholders: container.querySelectorAll('[data-deferred]').length,
      retainedServerInputs: hydratedInputs.filter((input) =>
        serverInputs.includes(input),
      ).length,
      values: hydratedInputs.map((input) => input.value),
    });
    expect(recoverableErrors, diagnostics).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    expect(hydratedInputs).toHaveLength(40);
    hydratedInputs.forEach((input, index) => {
      expect(input).toBe(serverInputs[index]);
    });
  });

  const hydrate = async (form: ReactElement) => {
    container.innerHTML = renderToString(form);
    consoleErrors.length = 0;
    const serverInputs = [...container.querySelectorAll('input')];
    vi.stubGlobal('IntersectionObserver', IdleObserver);
    await act(async () => {
      root = hydrateRoot(container, form, {
        onRecoverableError: (error) =>
          recoverableErrors.push(String(error).split('\n')[0]),
      });
    });
    return serverInputs;
  };

  it('preserves every server input through StrictMode hydration and effect replay', async () => {
    const serverInputs = await hydrate(
      <StrictMode>
        <Form
          jsonSchema={flatSchema}
          validationMode={ValidationMode.None}
          virtualization={virtualization}
        />
      </StrictMode>,
    );
    expect(serverInputs).toHaveLength(40);
    expect([...container.querySelectorAll('input')]).toEqual(serverInputs);
    serverInputs.forEach((input, index) => {
      expect(container.querySelectorAll('input')[index]).toBe(input);
      expect(input.value).toBe(`value_${index}`);
    });
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  it('keeps hydrated children revealed after a nested branch remount', async () => {
    const ref = createRef<FormHandle>();
    const serverInputs = await hydrate(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { nested: flatSchema } }}
        validationMode={ValidationMode.None}
        virtualization={virtualization}
      />,
    );
    expect(serverInputs).toHaveLength(40);
    expect(recoverableErrors).toEqual([]);
    await act(async () => ref.current!.remount('/nested'));
    expect(container.querySelectorAll('input')).toHaveLength(40);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    expect(container.querySelector('input')).not.toBe(serverInputs[0]);
    expect(consoleErrors).toEqual([]);
  });

  it('gates a new array item after hydration without hiding existing items', async () => {
    const ref = createRef<FormHandle>();
    const serverInputs = await hydrate(
      <Form
        ref={ref}
        jsonSchema={{ type: 'array', items: { type: 'string' } }}
        defaultValue={Array.from(
          { length: 40 },
          (_, index) => `value_${index}`,
        )}
        validationMode={ValidationMode.None}
        virtualization={virtualization}
      />,
    );
    expect(serverInputs).toHaveLength(40);
    expect(recoverableErrors).toEqual([]);
    await act(async () => {
      const node = ref.current!.node!;
      if (node.type !== 'array') throw new Error('Expected array');
      node.push('added');
    });
    expect(container.querySelectorAll('input')).toHaveLength(40);
    serverInputs.forEach((input, index) =>
      expect(container.querySelectorAll('input')[index]).toBe(input),
    );
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(1);
    expect(
      container.querySelector('[data-path="/40"][data-deferred]'),
    ).not.toBeNull();
    expect(ref.current!.getValue()).toHaveLength(41);
    expect(consoleErrors).toEqual([]);
  });

  it('hydrates a Suspense boundary inside a custom branch input without recoverable errors', async () => {
    const serverInputs = await hydrate(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            nested: { ...flatSchema, options: { terminal: false } },
          },
        }}
        fieldInputMap={{ '^/nested$': SuspendedBranch }}
        validationMode={ValidationMode.None}
        virtualization={virtualization}
      />,
    );
    expect(serverInputs).toHaveLength(40);
    expect(suspenseProbeCommits).toBe(1);
    expect(recoverableErrors).toEqual([]);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    serverInputs.forEach((input, index) =>
      expect(container.querySelectorAll('input')[index]).toBe(input),
    );
    expect(consoleErrors).toEqual([]);
  });

  it('gates a client-only createRoot mount in its first committed render', async () => {
    vi.stubGlobal('IntersectionObserver', IdleObserver);
    const commits: Array<[number, number]> = [];
    const Capture = () => {
      useLayoutEffect(() => {
        commits.push([
          container.querySelectorAll('input').length,
          container.querySelectorAll('[data-deferred]').length,
        ]);
      }, []);
      return null;
    };
    await act(async () => {
      root = createRoot(container);
      root.render(
        <>
          <Form
            jsonSchema={flatSchema}
            validationMode={ValidationMode.None}
            virtualization={virtualization}
          />
          <Capture />
        </>,
      );
    });
    expect(commits).toEqual([[20, 20]]);
    expect(consoleErrors).toEqual([]);
  });

  it('keeps hydrated children revealed after a branch is disabled and enabled', async () => {
    const ref = createRef<FormHandle>();
    await hydrate(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            show: { type: 'boolean', default: true },
            nested: { ...flatSchema, controls: { visible: '../show' } },
          },
        }}
        validationMode={ValidationMode.None}
        virtualization={virtualization}
      />,
    );
    expect(container.querySelectorAll('input')).toHaveLength(41);
    await act(async () => ref.current!.findNode('/show')!.setValue(false));
    expect(container.querySelectorAll('input')).toHaveLength(1);
    await act(async () => ref.current!.findNode('/show')!.setValue(true));
    expect(container.querySelectorAll('input')).toHaveLength(41);
    expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
    expect(recoverableErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  it.each(['client-only', 'after hydration'] as const)(
    'keeps an item mounted below threshold revealed across remount: %s',
    async (mode) => {
      const ref = createRef<FormHandle>();
      const form = (
        <Form
          ref={ref}
          jsonSchema={{ type: 'array', items: { type: 'string' } }}
          defaultValue={[]}
          validationMode={ValidationMode.None}
          virtualization={{
            threshold: 2,
            eagerCount: 0,
            backfill: VirtualizationBackfill.None,
          }}
        />
      );
      if (mode === 'after hydration') await hydrate(form);
      else {
        vi.stubGlobal('IntersectionObserver', IdleObserver);
        await act(async () => {
          root = createRoot(container);
          root.render(form);
        });
      }
      const array = ref.current!.node!;
      if (array.type !== 'array') throw new Error('Expected array');
      await act(async () => {
        array.push('first');
      });
      expect(container.querySelectorAll('input')).toHaveLength(1);
      expect(container.querySelectorAll('[data-deferred]')).toHaveLength(0);
      await act(async () => {
        array.push('second');
      });
      expect(container.querySelectorAll('input')).toHaveLength(1);
      expect(container.querySelectorAll('[data-deferred]')).toHaveLength(1);
      await act(async () => ref.current!.remount());
      expect(container.querySelectorAll('input')).toHaveLength(1);
      expect(container.querySelector<HTMLInputElement>('input')!.value).toBe(
        'first',
      );
      expect(
        container.querySelector('[data-path="/1"][data-deferred]'),
      ).not.toBeNull();
      expect(recoverableErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    },
  );

  it.each(['client-only', 'after hydration'] as const)(
    'does not record a hidden array item as revealed before its real input mounts: %s',
    async (mode) => {
      const ref = createRef<FormHandle>();
      const form = (
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              show: { type: 'boolean', default: false },
              items: {
                type: 'array',
                default: ['first'],
                items: { type: 'string', controls: { visible: '../../show' } },
              },
            },
          }}
          validationMode={ValidationMode.None}
          virtualization={{
            threshold: 2,
            eagerCount: 0,
            backfill: VirtualizationBackfill.None,
          }}
        >
          <Form.Render path="/items" />
        </Form>
      );
      if (mode === 'after hydration') await hydrate(form);
      else {
        vi.stubGlobal('IntersectionObserver', IdleObserver);
        await act(async () => {
          root = createRoot(container);
          root.render(form);
        });
      }
      const array = ref.current!.findNode('/items')!;
      if (array.type !== 'array') throw new Error('Expected array');
      expect(ref.current!.findNode('/items/0')!.visible).toBe(false);
      expect(container.querySelectorAll('input')).toHaveLength(0);
      await act(async () => {
        array.push('second');
      });
      await act(async () => ref.current!.remount('/items'));
      await act(async () => {
        ref.current!.findNode('/show')!.setValue(true);
      });
      expect(ref.current!.findNode('/items/0')!.visible).toBe(true);
      expect(
        container.querySelector('[data-path="/items/0"][data-deferred]'),
      ).not.toBeNull();
      expect(container.querySelector('[id="/items/0"]')).toBeNull();
      expect(recoverableErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    },
  );
});
