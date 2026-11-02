import { expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core';
import { ShowError } from '@/schema-form/types';

import { createShowErrorChecker } from '../createShowErrorChecker';

it('Edited keeps the input-state bit and EditedTouched keeps the default display policy', () => {
  expect(ShowError).toHaveProperty('Edited', 4);
  expect(ShowError).toHaveProperty('EditedTouched', 16);
  expect(ShowError).not.toHaveProperty('Dirty');
  expect(ShowError).not.toHaveProperty('DirtyTouched');
  const edited = { [FieldNodeState.Edited]: true };
  const touched = { [FieldNodeState.Touched]: true };
  const both = { ...edited, ...touched };
  expect(createShowErrorChecker(ShowError.Edited)(edited)).toBe(true);
  expect(createShowErrorChecker(ShowError.EditedTouched)(edited)).toBe(false);
  expect(createShowErrorChecker(ShowError.EditedTouched)(touched)).toBe(false);
  expect(createShowErrorChecker(undefined)(both)).toBe(true);
  expect(createShowErrorChecker(undefined)(edited)).toBe(false);
  expect(
    createShowErrorChecker(undefined)({
      ...both,
      [FieldNodeState.ErrorVisible]: false,
    }),
  ).toBe(false);
});
