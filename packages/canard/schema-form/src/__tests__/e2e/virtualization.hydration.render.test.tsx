import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, ValidationMode, VirtualizationBackfill } from '@/schema-form';

describe('virtualization across server rendering and client hydration', () => {
  let container: HTMLDivElement;
  let root: Root | undefined;
  let recoverableErrors: string[];
  let consoleErrors: string[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    recoverableErrors = [];
    consoleErrors = [];
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(args.map((arg) => String(arg).split('\n')[0]).join(' '));
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

  it.skip('preserves server inputs without hydration mismatch when an IO-enabled client gates a branch at threshold; known SSR defect, keep virtualization off on server-rendered pages until fixed', async () => {
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
});
