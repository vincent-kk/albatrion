import { act, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createChildCacheSuspension } from './helpers/createChildCacheSuspension';

afterEach(cleanup);

describe.each([false, true])(
  'child cache suspension, StrictMode=%s',
  (strict) => {
    it('retries an initial suspension with unique keys and retains the committed types afterwards', async () => {
      const form = createChildCacheSuspension(strict, true);
      expect(form.container.textContent).toContain('Waiting');
      await form.resume();
      const fields = [...form.fields()];
      const inputs = [...form.container.querySelectorAll('input')];
      expect(fields.map((Child) => Child.key)).toEqual(['0', '1']);
      form.rerenderProbe();
      expect(form.fields()).toEqual(fields);
      expect([...form.container.querySelectorAll('input')]).toEqual(inputs);
      expect(form.mounted.current).toBe(2);
    });

    it('keeps committed component types, keys and DOM after suspension and retry', async () => {
      const form = createChildCacheSuspension(strict);
      const fields = [...form.fields()];
      const inputs = [...form.container.querySelectorAll('input')];
      form.suspend();
      expect(form.container.textContent).toContain('Waiting');
      await form.resume();
      form.fields().forEach((Child, index) => {
        expect(Child).toBe(fields[index]);
        expect(Child.key).toBe(fields[index].key);
      });
      expect([...form.container.querySelectorAll('input')]).toEqual(inputs);
      expect(form.mounted.current).toBe(2);
    });

    it('does not reuse an aborted transition key or remount committed inputs', async () => {
      const form = createChildCacheSuspension(strict);
      const fields = [...form.fields()];
      const inputs = [...form.container.querySelectorAll('input')];
      act(() => {
        form.parent.push('speculative');
        form.attempt();
      });
      expect(form.fields().map((Child) => Child.key)).toEqual(['0', '1', '2']);
      act(() => form.parent.remove(2));
      await form.resume();
      expect(form.fields()).toEqual(fields);
      expect([...form.container.querySelectorAll('input')]).toEqual(inputs);
      act(() => form.parent.push('committed'));
      form.rerenderProbe();
      expect(form.fields().map((Child) => Child.key)).toEqual(['0', '1', '3']);
      expect(form.fields()[0]).toBe(fields[0]);
      expect(form.fields()[1]).toBe(fields[1]);
      expect(form.container.querySelectorAll('input')[0]).toBe(inputs[0]);
      expect(form.container.querySelectorAll('input')[1]).toBe(inputs[1]);
    });
  },
);
