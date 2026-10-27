import { afterEach, expect, it, vi } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import * as lists from '../utils/commit/utils/inactiveValues/updateInactiveHostLists';
import { createInactiveMemoPublicTree } from './fixtures/createInactiveMemoPublicTree';

const previousMode = engineModes.inactiveValues;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('inactiveValues', previousMode);
});

it('executes nonempty incremental host-list maintenance for the benchmark public setValue path', () => {
  engineModes.setMode('inactiveValues', 'incremental');
  const root = createInactiveMemoPublicTree(80);
  const update = vi.spyOn(lists, 'updateInactiveHostLists');
  root.find('/kind')!.setValue('kind_79');
  expect(update.mock.calls.length).toBeGreaterThan(0);
  expect(update.mock.calls.some(([, changes]) => changes.length > 0)).toBe(
    true,
  );
});
