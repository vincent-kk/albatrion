import { StrictMode, useLayoutEffect } from 'react';

import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';
import type { FieldInputProps } from '@/schema-form/types';

const counts = vi.hoisted(() => ({ slots: [] as string[], input: 0 }));

vi.mock('../hooks/useChildFields', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../hooks/useChildFields')>();
  return {
    ...actual,
    useChildFields(...args: Parameters<typeof actual.useChildFields>) {
      counts.slots.push(args[0].path);
      return actual.useChildFields(...args);
    },
  };
});

/** Observe the slot and user input before the passive snapshot consistency check. */
it.each([false, true])(
  'does not rerender branch slots or inputs after hydration commit, StrictMode=%s',
  async (strict) => {
    const container = document.createElement('div');
    document.body.append(container);
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((...args) => {
        consoleErrors.push(String(args[0]));
      });
    let committed: { slot: number; input: number } | undefined;
    const Branch = ({ ChildFields }: FieldInputProps) => {
      counts.input++;
      useLayoutEffect(() => {
        committed = {
          slot: counts.slots.filter((path) => path === '/nested').length,
          input: counts.input,
        };
      }, []);
      return (
        <>
          {ChildFields.map((Child) => (
            <Child key={Child.key} />
          ))}
        </>
      );
    };
    const form = (
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: Object.fromEntries(
                Array.from({ length: 40 }, (_, index) => [
                  `f${index}`,
                  { type: 'string', default: String(index) },
                ]),
              ),
            },
          },
        }}
        fieldInputMap={{ '^/nested$': Branch }}
        validationMode={ValidationMode.None}
        virtualization={{
          threshold: 30,
          eagerCount: 20,
          backfill: VirtualizationBackfill.None,
        }}
      />
    );
    const element = strict ? <StrictMode>{form}</StrictMode> : form;
    vi.stubGlobal('IntersectionObserver', undefined);
    container.innerHTML = renderToString(element);
    const serverInputs = [...container.querySelectorAll('input')];
    counts.slots.length = 0;
    counts.input = 0;
    consoleErrors.length = 0;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: (error) => errors.push(String(error)),
        });
      });
      const actual = {
        slot: counts.slots.filter((path) => path === '/nested').length,
        input: counts.input,
      };
      console.log(
        'IR5_HYDRATION_RENDER_COUNTS',
        JSON.stringify({ strict, committed, actual }),
      );
      expect(actual).toEqual(committed);
      expect(actual).toEqual({ slot: strict ? 2 : 1, input: strict ? 2 : 1 });
      expect(serverInputs).toHaveLength(40);
      serverInputs.forEach((input, index) =>
        expect(container.querySelectorAll('input')[index]).toBe(input),
      );
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  },
);
