import type { PropsWithChildren } from 'react';

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { FieldRendererContextProvider } from '@/schema-form/providers';

import { useChildFieldErrors } from '../fieldNode/useChildFieldErrors';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('joins the complete revision vector at most once for one subscribed child-error wave', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: Array(12).fill('a'),
    deferMountValidation: true,
    validationMode: 2,
  });
  const revisions = vi.spyOn(root, 'revision');
  const { result } = renderHook(() => useChildFieldErrors(root), {
    wrapper: ({ children }: PropsWithChildren) => (
      <FieldRendererContextProvider>{children}</FieldRendererContextProvider>
    ),
  });
  revisions.mockClear();
  act(() =>
    root.batch(() => {
      for (const child of root.children ?? [])
        child.setExternalErrors([
          { dataPath: child.path, message: child.path },
        ]);
    }),
  );
  expect(
    result.current.errorMatrix.every((issues) => issues.length === 1),
  ).toBe(true);
  expect(revisions.mock.calls.length).toBeLessThanOrEqual(1);
});
