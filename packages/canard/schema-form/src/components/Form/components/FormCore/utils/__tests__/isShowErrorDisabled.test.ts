import { expect, it } from 'vitest';

import { ShowError } from '@/schema-form/types';

import { isShowErrorDisabled } from '../isShowErrorDisabled';

it.each([
  [false, true],
  [ShowError.Never, true],
  [ShowError.Never | ShowError.Edited, true],
  [true, false],
  [undefined, false],
  [ShowError.Always | ShowError.Never, false],
  [ShowError.EditedTouched, false],
  [ShowError.Touched, false],
] as const)(
  'ERROR-139 resolves policy %s as disabled=%s, as the renderer does',
  (policy, disabled) => {
    expect(isShowErrorDisabled(policy)).toBe(disabled);
  },
);
