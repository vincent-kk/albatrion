import { StrictMode } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Form, ValidationMode, VirtualizationBackfill } from '@/schema-form';

import {
  LiveObserver,
  idleCallbacks,
  liveOptions,
  liveSchema,
  mountVirtualization,
} from './helpers/liveVirtualization';

describe.each([false, true])(
  'live virtualization options (StrictMode=%s)',
  (strict) => {
    it('updates threshold without re-hiding revealed inputs', () => {
      const form = mountVirtualization(strict);
      const first = form.inputs()[0];
      form.options({ ...liveOptions, threshold: 10 });
      expect(form.deferred()).toHaveLength(0);
      const inputs = form.inputs();
      form.options(liveOptions);
      expect(form.inputs()).toEqual(inputs);
      expect(form.inputs()[0]).toBe(first);
      form.append('new');
      expect(form.deferred()).toHaveLength(1);
    });

    it('updates eagerCount on gates whose component identities were cached', () => {
      const form = mountVirtualization(strict);
      form.options({ ...liveOptions, eagerCount: 3 });
      expect(form.inputs()).toHaveLength(3);
      const inputs = form.inputs();
      form.options({ ...liveOptions, eagerCount: 0 });
      expect(form.inputs()).toEqual(inputs);
      expect(form.deferred()).toHaveLength(1);
    });

    it('re-observes only waiting placeholders and drops callbacks from the replaced observer', () => {
      const form = mountVirtualization(strict);
      const old = LiveObserver.instances.at(-1)!;
      act(() => old.reveal(form.deferred()[0]));
      const waiting = form.deferred();
      form.options({ ...liveOptions, rootMargin: '12px' });
      const current = LiveObserver.instances.at(-1)!;
      expect(current).not.toBe(old);
      expect(current.options.rootMargin).toBe('12px');
      expect([...current.observed]).toEqual(waiting);
      act(() => old.reveal(waiting[0]));
      expect(form.deferred()).toEqual(waiting);
      act(() => current.reveal(waiting[0]));
      expect(form.deferred()).toHaveLength(1);
    });

    it('starts and cancels idle backfill using the new option', () => {
      const form = mountVirtualization(strict);
      form.options({ ...liveOptions, backfill: VirtualizationBackfill.Idle });
      expect(idleCallbacks.size).toBe(1);
      form.options(liveOptions);
      expect(idleCallbacks.size).toBe(0);
      expect(form.deferred()).toHaveLength(3);
      form.options({ ...liveOptions, backfill: VirtualizationBackfill.Idle });
      act(() => {
        const [id, callback] = [...idleCallbacks][0];
        idleCallbacks.delete(id);
        callback({ didTimeout: true, timeRemaining: () => 50 });
      });
      expect(form.deferred()).toHaveLength(0);
    });

    it('updates placeholder presentation without replacing the observer or real input', () => {
      const form = mountVirtualization(strict);
      const observer = LiveObserver.instances.at(-1)!;
      const observations = observer.observe.mock.calls.length;
      const input = form.inputs()[0];
      const Placeholder = ({ height }: { height: number }) => (
        <span>height:{height}</span>
      );
      form.options({ ...liveOptions, estimateHeight: () => 73, Placeholder });
      expect(form.deferred()[0].style.height).toBe('73px');
      expect(form.deferred()[0].textContent).toBe('height:73');
      expect(LiveObserver.instances.at(-1)).toBe(observer);
      expect(observer.observe).toHaveBeenCalledTimes(observations);
      const Replacement = () => <span>replacement</span>;
      form.options({
        ...liveOptions,
        estimateHeight: 91,
        Placeholder: Replacement,
      });
      expect(form.deferred()[0].textContent).toBe('replacement');
      expect(form.deferred()[0].style.height).toBe('91px');
      expect(form.inputs()[0]).toBe(input);
      expect(LiveObserver.instances.at(-1)).toBe(observer);
    });

    it('updates a waiting duplicate even when another input position revealed the same node', () => {
      const element = (height: number) => {
        const form = (
          <Form
            jsonSchema={liveSchema}
            defaultValue={['a', 'b', 'c']}
            virtualization={{ ...liveOptions, estimateHeight: height }}
            validationMode={ValidationMode.None}
          >
            <Form.Input path="" />
            <Form.Input path="/1" />
          </Form>
        );
        return strict ? <StrictMode>{form}</StrictMode> : form;
      };
      const form = render(element(40));
      expect(
        form.container.querySelector('[data-path="/1"][data-deferred]'),
      ).not.toBeNull();
      form.rerender(element(73));
      expect(
        form.container.querySelector('[data-path="/1"][data-deferred]'),
      ).toBeNull();
      expect(
        form.container.querySelector<HTMLElement>('[data-deferred]')?.style
          .height,
      ).toBe('73px');
    });

    it('ignores equal primitive and callback references in a new options object', () => {
      const estimateHeight = vi.fn(() => 63);
      const Placeholder = vi.fn(() => <span>waiting</span>);
      const options = { ...liveOptions, estimateHeight, Placeholder };
      const form = mountVirtualization(strict, options);
      const observer = LiveObserver.instances.at(-1)!;
      const observations = observer.observe.mock.calls.length;
      const count = LiveObserver.instances.length;
      const estimates = estimateHeight.mock.calls.length;
      const visuals = Placeholder.mock.calls.length;
      form.options({ ...options });
      expect(LiveObserver.instances).toHaveLength(count);
      expect(estimateHeight).toHaveBeenCalledTimes(estimates);
      expect(Placeholder).toHaveBeenCalledTimes(visuals);
      expect(observer.observe).toHaveBeenCalledTimes(observations);
      expect(form.deferred()).toHaveLength(3);
    });
  },
);
