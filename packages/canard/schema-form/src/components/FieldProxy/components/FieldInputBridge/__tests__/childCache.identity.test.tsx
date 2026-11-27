import { type PropsWithChildren, StrictMode } from 'react';

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { useChildFields } from '../hooks/useChildFields';
import type { ChildField } from '../type';

const EmptyProxy = () => null;
const terminal: ChildField[] = [];
afterEach(cleanup);

describe.each([false, true])(
  'child cache identity, StrictMode=%s',
  (strict) => {
    it('keeps type/key on rerender and refreshes only the surviving path and field', () => {
      const parent = nodeFromJSONSchema({
        jsonSchema: { type: 'array', items: { type: 'string' } },
        defaultValue: ['a', 'b', 'c'],
      });
      const mounted = { current: 0 };
      const wrapper = ({ children }: PropsWithChildren) =>
        strict ? <StrictMode>{children}</StrictMode> : <>{children}</>;
      const hook = renderHook(
        () => useChildFields(parent, EmptyProxy, mounted, terminal)[0],
        { wrapper },
      );
      const survivor = parent.children![2];
      const Child = hook.result.current[2];
      const key = Child.key;
      hook.rerender();
      expect(hook.result.current[2]).toBe(Child);
      expect(Child.key).toBe(key);
      act(() => parent.remove(1));
      hook.rerender();
      expect(parent.children![1]).toBe(survivor);
      expect(hook.result.current[1]).toBe(Child);
      expect(Child.key).toBe(key);
      expect(Child.path).toBe('/1');
      expect(Child.field).toBe('1');
      act(() => parent.push('new'));
      hook.rerender();
      expect(hook.result.current[1]).toBe(Child);
      expect(hook.result.current[2].key).not.toBe(key);
      expect(hook.result.current.map((child) => child.key)).toEqual([
        '0',
        '2',
        '3',
      ]);
    });

    it('continues miss keys through an empty child list and does not consume keys on hits', () => {
      const parent = nodeFromJSONSchema({
        jsonSchema: { type: 'array', items: { type: 'string' } },
        defaultValue: ['a'],
      });
      const mounted = { current: 0 };
      const wrapper = ({ children }: PropsWithChildren) =>
        strict ? <StrictMode>{children}</StrictMode> : <>{children}</>;
      const hook = renderHook(
        () => useChildFields(parent, EmptyProxy, mounted, terminal)[0],
        { wrapper },
      );
      expect(hook.result.current[0].key).toBe('0');
      hook.rerender();
      hook.rerender();
      act(() => parent.clear());
      hook.rerender();
      expect(hook.result.current).toEqual([]);
      act(() => parent.push('b'));
      hook.rerender();
      expect(hook.result.current[0].key).toBe('1');
      act(() => parent.push('c'));
      hook.rerender();
      expect(hook.result.current.map((child) => child.key)).toEqual(['1', '2']);
    });
  },
);
