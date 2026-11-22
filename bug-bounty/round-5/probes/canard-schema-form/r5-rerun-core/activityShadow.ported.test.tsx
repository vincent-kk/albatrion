import { plugin } from '@canard/schema-form-ajv8-plugin';
import * as React from 'react';
import { type ReactNode, StrictMode, createRef } from 'react';

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, inject, it, vi } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  ValidationMode,
  VirtualizationBackfill,
  registerPlugin,
} from '@/schema-form';

import { createRenderValidator } from '../../__tests__/helpers/createRenderValidator';
import { settleValidation } from '../../__tests__/helpers/settleValidation';

/**
 * Ports of control tests that the round 4 identifier design broke:
 * - bug-bounty/round-2/probes/canard-schema-form/r2-react/activity.test.tsx, the two tests that
 *   selected `input[id="/name"]` or compared `activeElement.id` with a path (siblings of round 1
 *   item 2, high);
 * - bug-bounty/round-3/probes/canard-schema-form/r3-react/shadowRoot.test.tsx (EQ4 controls).
 * Elements are found through `data-path` wrappers and labels through `htmlFor === control.id`;
 * the assertions are otherwise unchanged. The ajv8 plugin is imported by package name (dist).
 */

const hosts: HTMLElement[] = [];
beforeAll(() => {
  registerPlugin({ validator: createRenderValidator() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  for (const host of hosts.splice(0)) host.remove();
});

const Activity = (React as any).Activity as React.ComponentType<{
  mode: 'hidden' | 'visible';
  children: ReactNode;
}>;
const skip18 = (context: { skip: (m: string) => void }) => {
  if (inject('reactMajor') === '18') context.skip('React 18 has no Activity');
};
const wrap = (strict: boolean, node: ReactNode) =>
  strict ? <StrictMode>{node}</StrictMode> : node;
const pathOf = (element: Element | null | undefined) =>
  element?.closest('[data-path]')?.getAttribute('data-path') ?? null;
const fieldOf = (scope: ParentNode, path: string) =>
  Array.from(scope.querySelectorAll<HTMLElement>('[data-path]')).find(
    (element) => element.getAttribute('data-path') === path,
  )!;

it.for([false, true])(
  'visible touched error survives hiding and showing the form (StrictMode=%s)',
  async (strict, context) => {
    skip18(context);
    const ref = createRef<FormHandle>();
    const user = userEvent.setup();
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', minLength: 5 } },
    } as const;
    const tree = (mode: 'hidden' | 'visible') =>
      wrap(
        strict,
        <Activity mode={mode}>
          <Form
            ref={ref}
            jsonSchema={schema}
            errorVisibility={ErrorVisibility.AfterEditAndTouch}
            validationMode={ValidationMode.OnChange}
          >
            <Form.Input path="/name" />
            <Form.ErrorMessage path="/name" />
          </Form>
        </Activity>,
      );
    const view = render(tree('visible'));
    const input = () => view.container.querySelector('input') as HTMLInputElement;
    await user.click(input());
    await user.type(input(), 'ab');
    await user.tab();
    await settleValidation(() => ref.current?.node);
    const shown = view.container.querySelector('em')?.textContent ?? '';
    expect(shown).not.toBe('');
    const state = ref.current!.getState();
    const handle = ref.current!;
    view.rerender(tree('hidden'));
    await act(async () => {});
    view.rerender(tree('visible'));
    await act(async () => {});
    await settleValidation(() => handle.node);
    expect(view.container.querySelector('em')?.textContent ?? '').toBe(shown);
    expect(ref.current!.getState()).toEqual(state);
  },
);

class ManualObserver {
  static instances: ManualObserver[] = [];
  targets = new Set<Element>();
  constructor(public callback: IntersectionObserverCallback) {
    ManualObserver.instances.push(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
}

const bigSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 40 }, (_, i) => [`f${i}`, { type: 'string', default: `v${i}` }]),
  ),
} as const;

it.for([false, true])(
  'focus reaches a deferred field after the form was hidden and shown (StrictMode=%s)',
  async (strict, context) => {
    skip18(context);
    ManualObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', ManualObserver);
    const ref = createRef<FormHandle>();
    const tree = (mode: 'hidden' | 'visible') =>
      wrap(
        strict,
        <Activity mode={mode}>
          <Form
            ref={ref}
            jsonSchema={bigSchema as any}
            validationMode={ValidationMode.None}
            virtualization={{ threshold: 30, eagerCount: 10, backfill: VirtualizationBackfill.None }}
          />
        </Activity>,
      );
    const view = render(tree('visible'));
    await act(async () => {});
    view.rerender(tree('hidden'));
    await act(async () => {});
    view.rerender(tree('visible'));
    await act(async () => {});
    await act(async () => {
      ref.current!.focus('/f35');
    });
    await act(async () => {});
    expect(pathOf(document.activeElement)).toBe('/f35');
    await act(async () => {
      ref.current!.focus('/f2');
    });
    expect(pathOf(document.activeElement)).toBe('/f2');
  },
);

const mountTarget = (shadow: boolean) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  hosts.push(host);
  if (!shadow) return { container: host, scope: document as Document | ShadowRoot };
  const root = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  root.appendChild(container);
  return { container, scope: root as Document | ShadowRoot };
};

const shadowSchema = {
  type: 'object',
  properties: {
    first: { type: 'string', default: 'x' },
    agree: { type: 'boolean' },
    name: { type: 'string', minLength: 3 },
  },
  required: ['name'],
} as const;

it.for([false, true])('shadow=%s: clicking a field label toggles its boolean input', (shadow) => {
  const { container } = mountTarget(shadow);
  const ref = createRef<FormHandle<typeof shadowSchema>>();
  render(<Form ref={ref} jsonSchema={shadowSchema} validationMode={ValidationMode.None} />, {
    container,
  });
  const checkbox = fieldOf(container, '/agree').querySelector('input')!;
  const label = Array.from(container.querySelectorAll('label')).find(
    (candidate) => candidate.htmlFor === checkbox.id,
  )!;
  expect(label).toBeDefined();
  act(() => {
    fireEvent.click(label);
  });
  expect(ref.current?.getValue()?.agree).toBe(true);
});

it.for([false, true])('shadow=%s: FormHandle.focus(path) focuses the field input', (shadow) => {
  const { container, scope } = mountTarget(shadow);
  const ref = createRef<FormHandle<typeof shadowSchema>>();
  render(<Form ref={ref} jsonSchema={shadowSchema} validationMode={ValidationMode.None} />, {
    container,
  });
  act(() => {
    ref.current?.focus('/name');
  });
  expect(pathOf(scope.activeElement)).toBe('/name');
});

it.for([false, true])(
  'shadow=%s: native submit of an invalid form focuses the first invalid input',
  async (shadow) => {
    const { container, scope } = mountTarget(shadow);
    const ref = createRef<FormHandle<typeof shadowSchema>>();
    render(
      <Form
        ref={ref}
        jsonSchema={shadowSchema}
        validatorFactory={plugin.validator}
        errorVisibility={ErrorVisibility.AfterEditAndTouch}
      >
        <div data-path="/first">
          <Form.Input path="/first" />
        </div>
        <div data-path="/name">
          <Form.Input path="/name" />
        </div>
        <Form.ErrorMessage path="/name" />
        <button type="submit">go</button>
      </Form>,
      { container },
    );
    container.querySelector('button')!.focus();
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    await waitFor(() => expect(pathOf(scope.activeElement)).toBe('/name'));
  },
);
