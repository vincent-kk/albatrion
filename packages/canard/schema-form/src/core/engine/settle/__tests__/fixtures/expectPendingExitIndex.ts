import { expect } from 'vitest';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import type { SettlementContext } from '../../types/settlement';

/** Recompute both index layers independently from exact pending keys after one maintenance site. */
export const expectPendingExitIndex = (
  context: Pick<
    SettlementContext<PlainNode>,
    'pendingExits' | 'pendingExitPaths'
  >,
): void => {
  const expected = new Map<string, Map<string, number>>();
  for (const key of context.pendingExits.keys()) {
    const path: string = JSON.parse(key)[0];
    const host = path.slice(0, path.lastIndexOf('/'));
    let paths = expected.get(host);
    if (!paths) expected.set(host, (paths = new Map()));
    paths.set(path, (paths.get(path) ?? 0) + 1);
  }
  const actual = context.pendingExitPaths ?? new Map();
  expect(
    [...actual].map(([host, paths]) => [host, [...paths].sort()]).sort(),
  ).toEqual(
    [...expected].map(([host, paths]) => [host, [...paths].sort()]).sort(),
  );
};
