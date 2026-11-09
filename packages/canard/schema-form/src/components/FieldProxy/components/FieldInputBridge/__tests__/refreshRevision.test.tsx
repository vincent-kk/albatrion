import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { FieldNodeEventType } from '@/schema-form/core';

import { useFieldInputControl } from '../hooks/useFieldInputControl';

afterEach(() => cleanup());

it('reads the Refresh revision once per render and keeps the subscribe catch-up', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const revision = vi.spyOn(node, 'revision');
  const children = { current: 0 };
  let renders = 0;
  const Host = () => {
    renders++;
    const [, generation] = useFieldInputControl(node, children);
    return <output>{generation}</output>;
  };
  const view = render(<Host />);
  view.rerender(<Host />);
  expect(
    revision.mock.calls.filter(
      ([mask]) => mask === FieldNodeEventType.RequestRefresh,
    ),
  ).toHaveLength(renders);
  expect(revision.mock.calls.length).toBeGreaterThan(renders);
});
