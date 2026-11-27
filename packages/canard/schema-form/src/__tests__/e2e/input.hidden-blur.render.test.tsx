import { cleanup } from '@testing-library/react';
import { afterEach, it } from 'vitest';

import { exerciseHiddenBlur } from './helpers/exerciseHiddenBlur';

afterEach(cleanup);

it.each([
  [true, 'setValue'],
  [true, 'reset'],
  [true, 'node'],
  [true, 'refresh'],
  [false, 'setValue'],
  [false, 'reset'],
  [false, 'node'],
  [false, 'refresh'],
] as const)(
  'a settled edit/blur synchronizes after %s hidden and %s (3 fresh mounts)',
  async (hidden, writer) => {
    await exerciseHiddenBlur(hidden, writer);
  },
  30000,
);

it('change alone synchronizes a hidden write (3 fresh mounts)', async () => {
  await exerciseHiddenBlur(true, 'setValue', false);
}, 30000);

it('StrictMode synchronizes a hidden write after settled blur (3 fresh mounts)', async () => {
  await exerciseHiddenBlur(true, 'setValue', true, true);
}, 30000);
