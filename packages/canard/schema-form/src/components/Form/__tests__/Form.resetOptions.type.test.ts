import { expectTypeOf, it } from 'vitest';

import { SetValueOption } from '@/schema-form/core';

import type { FormHandle } from '../type';

it('WRITE-015 LANDING-039 reset accepts only automatic-write flags', () => {
  const check = (handle: FormHandle) => {
    handle.reset();
    handle.reset(SetValueOption.DisableAutomaticWrites);
    handle.reset(SetValueOption.EnableAutomaticWrites);
    // @ts-expect-error Overwrite is a write mode, not a reset option.
    handle.reset(SetValueOption.Overwrite);
    // @ts-expect-error Merge is a write mode, not a reset option.
    handle.reset(SetValueOption.Merge);
  };
  expectTypeOf(check).toBeFunction();
});
