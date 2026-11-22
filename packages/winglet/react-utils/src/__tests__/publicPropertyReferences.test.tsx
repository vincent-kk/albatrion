import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';

import { useRestProperties, useSnapshotReference } from '../index';

it('publishes a new reference when an undefined-valued own key changes name', () => {
  const first: Record<string, unknown> = { a: 1, first: undefined };
  const next: Record<string, unknown> = { a: 1, next: undefined };
  const hook = renderHook(({ props }) => useRestProperties(props), {
    initialProps: { props: first },
  });
  const previous = hook.result.current;
  hook.rerender({ props: next });
  expect(hook.result.current).not.toBe(previous);
  expect(hook.result.current).toBe(next);
});

it('reads the previous committed snapshot in the next render', () => {
  const before = { value: 1 };
  const after = { value: 2 };
  const hook = renderHook(
    ({ value }) => {
      const reference = useSnapshotReference(value);
      return { inRender: reference.current, reference };
    },
    { initialProps: { value: before } },
  );
  hook.rerender({ value: after });
  expect(hook.result.current.inRender).toBe(before);
  expect(hook.result.current.reference.current).toBe(after);
});
