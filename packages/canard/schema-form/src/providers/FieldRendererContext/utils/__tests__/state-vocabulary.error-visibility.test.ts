import { expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core';
import { ErrorVisibility } from '@/schema-form/types';

import { createErrorVisibilityChecker } from '../createErrorVisibilityChecker';

it('Edited keeps the input-state bit and EditedTouched keeps the default display policy', () => {
  expect(ErrorVisibility).toHaveProperty('AfterEdit', 'afterEdit');
  expect(ErrorVisibility).toHaveProperty(
    'AfterEditAndTouch',
    'afterEditAndTouch',
  );
  expect(ErrorVisibility).not.toHaveProperty('Dirty');
  expect(ErrorVisibility).not.toHaveProperty('DirtyTouched');
  const edited = { [FieldNodeState.Edited]: true };
  const touched = { [FieldNodeState.Touched]: true };
  const both = { ...edited, ...touched };
  expect(createErrorVisibilityChecker(ErrorVisibility.AfterEdit)(edited)).toBe(
    true,
  );
  expect(
    createErrorVisibilityChecker(ErrorVisibility.AfterEditAndTouch)(edited),
  ).toBe(false);
  expect(
    createErrorVisibilityChecker(ErrorVisibility.AfterEditAndTouch)(touched),
  ).toBe(false);
  expect(createErrorVisibilityChecker(undefined)(both)).toBe(true);
  expect(createErrorVisibilityChecker(undefined)(edited)).toBe(false);
  expect(
    createErrorVisibilityChecker(undefined)({
      ...both,
      [FieldNodeState.ErrorVisibility]: false,
    }),
  ).toBe(false);
});
