import { type PropsWithChildren, StrictMode } from 'react';

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { FieldRendererContextProvider } from '@/schema-form/providers';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import { useChildFieldErrors } from '../hooks/useChildFieldErrors';

afterEach(cleanup);

it('LANDING-170 REACT-019 tracks child errors, state and reordered paths under StrictMode', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: ['a', 'b'],
  });
  const first = root.children![0];
  const second = root.children![1];
  const issue = { dataPath: '/1', keyword: 'external', message: 'second' };
  const { result } = renderHook(() => useChildFieldErrors(root), {
    wrapper: ({ children }: PropsWithChildren) => (
      <StrictMode>
        <FieldRendererContextProvider>{children}</FieldRendererContextProvider>
      </StrictMode>
    ),
  });
  act(() => {
    second.setExternalErrors([issue]);
    second.setState({ 4: true });
  });
  expect(result.current.errorMatrix[1]).toEqual([issue]);
  expect(result.current.showErrors).toEqual([false, true]);
  act(() => {
    if (root.type === 'array') root.remove(0);
  });
  expect(result.current.errorMatrix).toEqual([[issue]]);
  expect(second.path).toBe('/0');
  act(() => first.setExternalErrors([]));
  expect(result.current.errorMatrix).toEqual([[issue]]);
});
