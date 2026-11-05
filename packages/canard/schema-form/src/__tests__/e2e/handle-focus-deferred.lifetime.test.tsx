import { createRef, useLayoutEffect, useRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type FieldRendererProps, Form, type FormHandle } from '@/schema-form';

import {
  type FormHarness,
  renderForm,
  setupValidatorPlugin,
} from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Harness-owned forms are released before global browser doubles. */
let form: FormHarness | undefined;
beforeEach(() => {
  setupValidatorPlugin();
  vi.stubGlobal('IntersectionObserver', FocusSilentObserver);
});
afterEach(() => {
  form?.unmount();
  form = undefined;
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])('focus lifetime strict=%s', (strictMode) => {
  it('cancels a pending reservation on reset', async () => {
    const current = (form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    }));
    await act(async () => {
      current.handle.focus(focusTarget);
      current.handle.reset();
    });
    expect(current.field(focusTarget)).not.toBeNull();
    expect(document.activeElement).not.toBe(current.field(focusTarget));
  });
  it('removes the pending document listener when the form is unmounted', async () => {
    const current = (form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    }));
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    await act(async () => {
      current.handle.focus(focusTarget);
      current.unmount();
    });
    const focusListeners = add.mock.calls.filter(
      ([name]) => name === 'focusin',
    );
    expect(focusListeners).toHaveLength(1);
    expect(remove).toHaveBeenCalledWith('focusin', focusListeners[0][1], true);
    form = undefined;
  });
  it('keeps a first-mount request across effect replay without repeating target focus', async () => {
    const handle = createRef<FormHandle>();
    const Parent = () => {
      const requested = useRef(false);
      useLayoutEffect(() => {
        if (!requested.current) {
          requested.current = true;
          handle.current!.focus(focusTarget);
        }
      }, []);
      return (
        <Form
          ref={handle}
          jsonSchema={focusSchema}
          virtualization={focusVirtualization}
        />
      );
    };
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const view = render(<Parent />, { reactStrictMode: strictMode });
    await act(async () => {});
    const target = view.container.querySelector(`input[id="${focusTarget}"]`);
    expect(target).not.toBeNull();
    expect(document.activeElement).toBe(target);
    expect(
      focus.mock.contexts.filter((element) => element === target),
    ).toHaveLength(1);
  });
  it('does not let a disabled mounted duplicate consume the first-mount reservation', async () => {
    const handle = createRef<FormHandle>();
    let positions = 0;
    const Renderer = ({ node, Input }: FieldRendererProps) => (
      <Input
        disabled={
          node.path === '/target' && ++positions <= (strictMode ? 2 : 1)
        }
      />
    );
    const Parent = () => {
      const requested = useRef(false);
      useLayoutEffect(() => {
        if (!requested.current) {
          requested.current = true;
          handle.current!.focus('/target');
        }
      }, []);
      return (
        <Form
          ref={handle}
          jsonSchema={{
            type: 'object',
            properties: { target: { type: 'string' } },
            options: { virtual: { group: { fields: ['target'] } } },
          }}
          virtualization={focusVirtualization}
          FieldRenderer={Renderer}
        />
      );
    };
    const view = render(<Parent />, { reactStrictMode: strictMode });
    await act(async () => {});
    const enabled = view.container.querySelector(
      'input[id="/target"]:not(:disabled)',
    );
    expect(enabled).not.toBeNull();
    expect(document.activeElement).toBe(enabled);
  });
  it('cancels a target-owned gate request when another request wins before commit', async () => {
    const current = (form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    }));
    await act(async () => {
      current.handle.focus('/sibling');
      current.handle.focus('/first');
    });
    expect(document.activeElement).toBe(current.field('/first'));
  });
  it('does not replay focus from a target-owned gate after user movement', async () => {
    const current = (form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    }));
    await act(async () => {
      current.handle.focus('/sibling');
      current.field('/first')!.focus();
    });
    expect(document.activeElement).toBe(current.field('/first'));
  });
});
