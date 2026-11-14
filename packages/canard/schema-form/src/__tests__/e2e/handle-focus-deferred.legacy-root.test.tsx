import { createRef, useLayoutEffect } from 'react';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  vi,
} from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '@/schema-form';

import { setupValidatorPlugin } from '../renderForm';
import { FocusRootWithSubmit } from './helpers/FocusRootWithSubmit';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

beforeEach(() => {
  setupValidatorPlugin();
  vi.stubGlobal('IntersectionObserver', FocusSilentObserver);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
// React 18 act batches legacy updates, so the focus operations run outside act.
describe.skipIf(inject('reactMajor') !== '18')(
  'React 18 legacy focus commits',
  () => {
    it('owns the request before an ancestor reveal synchronously mounts a requesting input', () => {
      const handle = createRef<FormHandle>();
      const Input = ({ path }: FieldInputProps) => {
        useLayoutEffect(() => handle.current!.focus('/sibling'), []);
        return <input id={path} />;
      };
      const view = render(
        <Form
          ref={handle}
          jsonSchema={focusSchema}
          virtualization={focusVirtualization}
          fieldInputMap={{ [focusTarget]: Input }}
        />,
        { legacyRoot: true },
      );
      handle.current!.focus(focusTarget);
      expect(document.activeElement).toBe(
        view.container.querySelector('input[id="/sibling"]'),
      );
    });
    it('cancels the target-owned gate request during synchronous mount reentry', () => {
      const handle = createRef<FormHandle>();
      const Input = ({ path }: FieldInputProps) => {
        useLayoutEffect(() => handle.current!.focus('/first'), []);
        return <input id={path} />;
      };
      const view = render(
        <Form
          ref={handle}
          jsonSchema={focusSchema}
          virtualization={focusVirtualization}
          fieldInputMap={{ '/sibling': Input }}
        />,
        { legacyRoot: true },
      );
      handle.current!.focus('/sibling');
      expect(document.activeElement).toBe(
        view.container.querySelector('input[id="/first"]'),
      );
    });
    it('does not deliver a delayed target Focus after the batch and steal moved focus', () => {
      const handle = createRef<FormHandle>();
      const Input = ({ path }: FieldInputProps) => (
        <input id={path} onFocus={() => handle.current!.focus('/first')} />
      );
      const view = render(
        <Form
          ref={handle}
          jsonSchema={focusSchema}
          virtualization={focusVirtualization}
          fieldInputMap={{ [focusTarget]: Input }}
        />,
        { legacyRoot: true },
      );
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      handle.current!.node!.batch(() => handle.current!.focus(focusTarget));
      const target = view.container.querySelector(`input[id="${focusTarget}"]`);
      expect(target).not.toBeNull();
      expect(
        focus.mock.contexts.filter((element) => element === target),
      ).toHaveLength(1);
      expect(document.activeElement).toBe(
        view.container.querySelector('input[id="/first"]'),
      );
    });
    it('focuses the exact invalid input on a legacy native submission', async () => {
      const view = render(
        <Form
          jsonSchema={focusSchema}
          virtualization={focusVirtualization}
          fieldInputMap={{ '': FocusRootWithSubmit }}
        />,
        { legacyRoot: true },
      );
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => {
        const target = view.container.querySelector(
          `input[id="${focusTarget}"]`,
        );
        expect(target).not.toBeNull();
        expect(document.activeElement).toBe(target);
      });
    });
  },
);
