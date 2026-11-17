import { cleanup } from '@testing-library/react';
import { afterEach, inject, it } from 'vitest';

import { exerciseHiddenInput } from './helpers/exerciseHiddenInput';

afterEach(cleanup);

it.for([
  ['activity', false, 'setValue'],
  ['activity', false, 'reset'],
  ['activity', false, 'node'],
  ['activity', true, 'setValue'],
  ['activity', true, 'reset'],
  ['activity', true, 'node'],
  ['suspense', false, 'setValue'],
  ['suspense', false, 'reset'],
  ['suspense', false, 'node'],
  ['suspense', true, 'setValue'],
  ['suspense', true, 'reset'],
  ['suspense', true, 'node'],
] as const)(
  '%s reveal ends a hidden composition in StrictMode=%s after %s (20 fresh mounts)',
  async ([boundary, strict, writer], context) => {
    if (boundary === 'activity' && inject('reactMajor') === '18')
      return context.skip('React 18 has no Activity');
    await exerciseHiddenInput(boundary, strict, writer, true);
  },
);
