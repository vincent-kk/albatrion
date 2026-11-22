import { cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '../ModalManager';
import { nestedCancellation } from './helpers/nestedCancellation';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('shared cancellation with a suspended lower owner restores like the connected stack', async () => {
  const shown = await nestedCancellation(false);
  expect(shown).toEqual({
    results: [false, false],
    restored: true,
    inert: false,
    count: 0,
  });
  expect(await nestedCancellation(true)).toEqual(shown);
});
