import { expectTypeOf, it } from 'vitest';

import type { MuiContext } from '../type';

it('declares each runtime label lookup in MuiContext', () => {
  expectTypeOf<MuiContext>().toHaveProperty('checkboxLabels');
  expectTypeOf<MuiContext>().toHaveProperty('switchLabels');
});
