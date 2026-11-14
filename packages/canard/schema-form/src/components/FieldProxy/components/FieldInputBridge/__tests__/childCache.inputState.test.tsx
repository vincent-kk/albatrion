import { act, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createChildCacheForm } from './helpers/createChildCacheForm';

afterEach(cleanup);

describe.each([false, true])(
  'child cache input lifetime, StrictMode=%s',
  (strict) => {
    it('preserves surviving node/type/key, focused draft and selection through remove, insert and visual reorder', () => {
      const form = createChildCacheForm(strict);
      const node = form.parent.children![2];
      const Child = form.fields()[2];
      const key = Child.key;
      const input = form.input('/2');
      const initialMounts = form.events.mounts;
      expect(initialMounts).toBe(strict ? 6 : 3);
      input.focus();
      fireEvent.compositionStart(input);
      fireEvent.input(input, { target: { value: 'draft text' } });
      input.setSelectionRange(2, 7);
      act(() => form.parent.remove(0));
      expect(form.parent.children![1]).toBe(node);
      expect(form.fields()[1]).toBe(Child);
      expect(Child.key).toBe(key);
      expect(form.input('/1')).toBe(input);
      expect(document.activeElement).toBe(input);
      expect([input.selectionStart, input.selectionEnd, input.value]).toEqual([
        2,
        7,
        'draft text',
      ]);
      expect(form.events.mounts).toBe(initialMounts);
      act(() => form.parent.insert(0, 'inserted'));
      expect(form.fields()[2]).toBe(Child);
      expect(form.input('/2')).toBe(input);
      expect(form.events.mounts).toBe(initialMounts + (strict ? 2 : 1));
      form.presentation('reverse');
      expect(form.fields()[2]).toBe(Child);
      expect(document.activeElement).toBe(input);
      expect([input.selectionStart, input.selectionEnd, input.value]).toEqual([
        2,
        7,
        'draft text',
      ]);
      expect(form.events.compositionEnds).toBe(0);
      fireEvent.compositionEnd(input, { data: 'draft text' });
      expect(form.events.compositionEnds).toBe(1);
      expect(node.value).toBe('draft text');
      expect(form.input('/2')).toBe(input);
    });

    it('retains cache types when a custom branch renders no children and later reopens', () => {
      const form = createChildCacheForm(strict);
      const fields = [...form.fields()];
      const nodes = [...form.parent.children!];
      form.presentation('none');
      expect(form.container.querySelectorAll('input')).toHaveLength(0);
      expect(form.fields()).toEqual(fields);
      form.presentation('all');
      expect(form.parent.children).toEqual(nodes);
      form.fields().forEach((Child, index) => {
        expect(Child).toBe(fields[index]);
        expect(Child.key).toBe(fields[index].key);
      });
      expect(form.container.querySelectorAll('input')).toHaveLength(3);
    });
  },
);
