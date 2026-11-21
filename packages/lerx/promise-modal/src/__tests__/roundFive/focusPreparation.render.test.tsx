import * as React from 'react';

import { cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { runFocusCase } from './helpers/runFocusCase';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});
it.each(['resuspended', 'hidden'] as const)(
  'focuses a real inside control before %s',
  async (state) => {
    expect(await runFocusCase(state, 'abort', 'inside')).toMatchObject({
      focusedInsideBeforeTransition: true,
    });
  },
);
// React 18 does not provide Activity.
it.skipIf(!React.Activity)(
  'focuses a real inside control before Activity hides it',
  async () => {
    expect(await runFocusCase('activity', 'cleanup', 'inside')).toMatchObject({
      focusedInsideBeforeTransition: true,
    });
  },
);
