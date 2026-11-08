import { StrictMode, createRef, useState } from 'react';

import { act, render } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeState,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  VirtualizationBackfill,
} from '@/schema-form';

import {
  LiveObserver,
  idleCallbacks,
  liveOptions,
  liveSchema,
  mountVirtualization,
} from './helpers/liveVirtualization';

describe.each([false, true])(
  'live virtualization lifecycle (StrictMode=%s)',
  (strict) => {
    it('runs off/on/off/on without hiding mounted nodes or changing their state', () => {
      const form = mountVirtualization(strict, false);
      const root = form.ref.current!.node!;
      const field = form.ref.current!.findNode('/0')!;
      act(() => {
        field.setValue('edited');
        field.setState({
          [FieldNodeState.Edited]: true,
          [FieldNodeState.Touched]: true,
        });
        field.setExternalErrors([{ dataPath: '/0', message: 'external issue' }]);
      });
      const first = form.inputs()[0];
      const value = root.value;
      const state = field.state;
      const errors = field.errors;
      form.options(liveOptions);
      expect(form.inputs()).toHaveLength(4);
      expect(form.inputs()[0]).toBe(first);
      expect(root.value).toBe(value);
      expect(field.state).toBe(state);
      expect(field.errors).toBe(errors);
      expect(form.ref.current!.node).toBe(root);
      form.append('new');
      expect(form.deferred()).toHaveLength(1);
      form.options(false);
      expect(form.inputs()).toHaveLength(5);
      expect(form.deferred()).toHaveLength(0);
      form.options(liveOptions);
      act(() => form.ref.current!.remount());
      expect(form.inputs()).toHaveLength(5);
      expect(form.deferred()).toHaveLength(0);
      form.append('later');
      expect(form.deferred()).toHaveLength(1);
    });

    it('reads current options when a prepared gate first mounts later', () => {
      let show!: () => void;
      const Branch = ({ ChildFields }: FieldInputProps) => {
        const [visible, setVisible] = useState(false);
        show = () => setVisible(true);
        return visible ? (
          <>
            {ChildFields.map((Child) => (
              <Child key={Child.key} />
            ))}
          </>
        ) : null;
      };
      const fields = { '^$': Branch };
      const element = (threshold: number) => {
        const form = (
          <Form
            jsonSchema={liveSchema}
            defaultValue={['a', 'b', 'c']}
            fieldInputMap={fields}
            virtualization={{ ...liveOptions, threshold }}
            validationMode={ValidationMode.None}
          />
        );
        return strict ? <StrictMode>{form}</StrictMode> : form;
      };
      const form = render(element(2));
      expect(form.container.querySelectorAll('input')).toHaveLength(0);
      form.rerender(element(10));
      act(show);
      expect(form.container.querySelectorAll('input')).toHaveLength(3);
      expect(form.container.querySelectorAll('[data-deferred]')).toHaveLength(
        0,
      );
    });

    it('disables observer and idle work while revealing every waiting gate', () => {
      const form = mountVirtualization(strict, {
        ...liveOptions,
        backfill: VirtualizationBackfill.Idle,
      });
      const observer = LiveObserver.instances.at(-1)!;
      expect(idleCallbacks.size).toBe(1);
      form.options(false);
      expect(form.inputs()).toHaveLength(4);
      expect(form.deferred()).toHaveLength(0);
      expect(idleCallbacks.size).toBe(0);
      expect(observer.observed.size).toBe(0);
      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('attaches the form focus guard when enabled after mount', () => {
      const ref = createRef<FormHandle>();
      const schema: JSONSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: { first: { type: 'string' }, target: { type: 'string' } },
        },
      };
      const element = (enabled: boolean) => {
        const form = (
          <Form
            ref={ref}
            jsonSchema={schema}
            defaultValue={[]}
            virtualization={enabled ? liveOptions : false}
            validationMode={ValidationMode.None}
          />
        );
        return strict ? <StrictMode>{form}</StrictMode> : form;
      };
      const form = render(element(false));
      form.rerender(element(true));
      act(() => {
        const node = ref.current!.node!;
        if (node.type !== 'array') throw new Error('Expected array');
        node.push({ first: 'a', target: 'b' });
        node.push({ first: 'c', target: 'd' });
      });
      expect(
        form.container.querySelector('[data-path="/1"][data-deferred]'),
      ).not.toBeNull();
      expect(form.container.querySelector('input[id="/1/target"]')).toBeNull();
      act(() => ref.current!.focus('/1/target'));
      expect(document.activeElement?.id).toBe('/1/target');
    });

    it('preserves hydrated DOM through enable and gates only later additions', async () => {
      const ref = createRef<FormHandle>();
      const defaults = ['a', 'b', 'c'];
      const element = (enabled: boolean) => {
        const form = (
          <Form
            ref={ref}
            jsonSchema={liveSchema}
            defaultValue={defaults}
            virtualization={enabled ? liveOptions : false}
            validationMode={ValidationMode.None}
          />
        );
        return strict ? <StrictMode>{form}</StrictMode> : form;
      };
      const container = document.createElement('div');
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      container.innerHTML = renderToString(element(false));
      consoleError.mockRestore();
      document.body.append(container);
      const server = [...container.querySelectorAll('input')];
      const errors: unknown[] = [];
      let root!: ReturnType<typeof hydrateRoot>;
      try {
        await act(async () => {
          root = hydrateRoot(container, element(false), {
            onRecoverableError: (error) => errors.push(error),
          });
        });
        await act(async () => root.render(element(true)));
        expect([...container.querySelectorAll('input')]).toEqual(server);
        await act(async () => {
          const node = ref.current!.node!;
          if (node.type !== 'array') throw new Error('Expected array');
          node.push('later');
        });
        expect(container.querySelectorAll('[data-deferred]')).toHaveLength(1);
        expect([...container.querySelectorAll('input')]).toEqual(server);
        expect(errors).toEqual([]);
      } finally {
        await act(async () => root?.unmount());
        container.remove();
      }
    });
  },
);
