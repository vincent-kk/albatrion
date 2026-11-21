import * as React from 'react';
import { type ReactNode, StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, inject, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
  VirtualizationBackfill,
  registerPlugin,
  useChildFieldErrors,
  useChildFieldMap,
} from '@/schema-form';

import { createRenderValidator } from '../../__tests__/helpers/createRenderValidator';
import { settleValidation } from '../../__tests__/helpers/settleValidation';

beforeAll(() => {
  registerPlugin({ validator: createRenderValidator() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
    const input = () =>
      view.container.querySelector('input[id="/name"]') as HTMLInputElement;
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
  fire() {
    const entries = [...this.targets].map(
      (target) => ({ target, isIntersecting: true }) as any,
    );
    if (entries.length) this.callback(entries, this as any);
  }
}

const bigSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 40 }, (_, i) => [
      `f${i}`,
      { type: 'string', default: `v${i}` },
    ]),
  ),
} as const;

it.for([false, true])(
  'deferred fields still reveal on intersection after the form was hidden and shown (StrictMode=%s)',
  async (strict, context) => {
    skip18(context);
    ManualObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', ManualObserver);
    const tree = (mode: 'hidden' | 'visible') =>
      wrap(
        strict,
        <Activity mode={mode}>
          <Form
            jsonSchema={bigSchema as any}
            validationMode={ValidationMode.None}
            virtualization={{
              threshold: 30,
              eagerCount: 10,
              backfill: VirtualizationBackfill.None,
            }}
          />
        </Activity>,
      );
    const view = render(tree('visible'));
    await act(async () => {});
    const deferred = () =>
      view.container.querySelectorAll('[data-deferred]').length;
    expect(deferred()).toBe(30);
    view.rerender(tree('hidden'));
    await act(async () => {});
    view.rerender(tree('visible'));
    await act(async () => {});
    await act(async () => {
      for (const o of ManualObserver.instances) o.fire();
    });
    expect(deferred()).toBe(0);
  },
);

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
            virtualization={{
              threshold: 30,
              eagerCount: 10,
              backfill: VirtualizationBackfill.None,
            }}
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
    expect(document.activeElement?.id).toBe('/f35');
    await act(async () => {
      ref.current!.focus('/f2');
    });
    expect(document.activeElement?.id).toBe('/f2');
  },
);

const ChildProbe = ({ node, ChildFields }: FieldInputProps) => {
  const errors = useChildFieldErrors(node);
  const map = useChildFieldMap(ChildFields ?? []);
  return (
    <section>
      <output data-testid="child-errors">
        {JSON.stringify(errors.errorMatrix.flat().map((e) => e.keyword))}
      </output>
      <output data-testid="child-keys">
        {JSON.stringify(Object.keys(map ?? {}))}
      </output>
      {ChildFields?.map((C) => <C key={C.key} />)}
    </section>
  );
};

it.for([false, true])(
  'child hooks inside a hidden subtree catch up writes made while hidden (StrictMode=%s)',
  async (strict, context) => {
    skip18(context);
    const ref = createRef<FormHandle>();
    const schema = {
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
            onlyB: {
              type: 'string',
              minLength: 3,
              default: 'x',
              controls: { active: '../kind === "b"' },
            },
          },
        },
      },
    } as const;
    const tree = (mode: 'hidden' | 'visible') =>
      wrap(
        strict,
        <Form
          ref={ref}
          jsonSchema={schema}
          errorVisibility={ErrorVisibility.Always}
        >
          <Activity mode={mode}>
            <Form.Field path="/group" FieldInput={ChildProbe} />
          </Activity>
          <Form.Render path="/group/kind">
            {({ value }) => <mark>{String(value)}</mark>}
          </Form.Render>
        </Form>,
      );
    const view = render(tree('visible'));
    await settleValidation(() => ref.current?.node);
    const before = view.getByTestId('child-keys').textContent;
    view.rerender(tree('hidden'));
    await act(async () => {});
    await act(async () => {
      ref.current!.setValue({ group: { kind: 'b', onlyB: 'x' } });
    });
    await settleValidation(() => ref.current?.node);
    view.rerender(tree('visible'));
    await act(async () => {});
    await settleValidation(() => ref.current?.node);
    expect(view.container.querySelector('mark')?.textContent).toBe('b');
    expect(view.getByTestId('child-keys').textContent).not.toBe(before);
    expect(
      JSON.parse(view.getByTestId('child-errors').textContent || '[]').length,
    ).toBeGreaterThan(0);
  },
);

const MatrixProbe = ({ node }: { node: any }) => {
  const errors = useChildFieldErrors(node);
  return (
    <output data-testid="matrix">
      {JSON.stringify(errors.errorMatrix.map((e) => e.length))}
    </output>
  );
};

it.for([false, true])(
  'useChildFieldErrors follows children added while its subtree was hidden (StrictMode=%s)',
  async (strict, context) => {
    skip18(context);
    const ref = createRef<FormHandle>();
    const schema = {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: { type: 'string', minLength: 3 },
          default: ['a'],
        },
      },
    } as const;
    const tree = (mode: 'hidden' | 'visible') =>
      wrap(
        strict,
        <Form ref={ref} jsonSchema={schema} errorVisibility={ErrorVisibility.Always}>
          <Activity mode={mode}>
            <Form.Render path="/list">
              {({ node }) => <MatrixProbe node={node} />}
            </Form.Render>
          </Activity>
        </Form>,
      );
    const view = render(tree('visible'));
    await settleValidation(() => ref.current?.node);
    expect(view.getByTestId('matrix').textContent).toBe('[1]');
    view.rerender(tree('hidden'));
    await act(async () => {});
    await act(async () => {
      (ref.current!.findNode('/list') as any).push('b');
      (ref.current!.findNode('/list') as any).push('ccc');
    });
    await settleValidation(() => ref.current?.node);
    view.rerender(tree('visible'));
    await act(async () => {});
    await settleValidation(() => ref.current?.node);
    expect(view.getByTestId('matrix').textContent).toBe('[1,1,0]');
  },
);
