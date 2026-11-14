import { expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core';
import { ErrorVisibility } from '@/schema-form/types';

import { createErrorVisibilityChecker } from '../createErrorVisibilityChecker';

it.each([
  [ErrorVisibility.Always, [true, true, true, true]],
  [ErrorVisibility.Never, [false, false, false, false]],
  [ErrorVisibility.AfterEdit, [false, true, false, true]],
  [ErrorVisibility.AfterTouch, [false, false, true, true]],
  [ErrorVisibility.AfterEditAndTouch, [false, false, false, true]],
  [ErrorVisibility.AfterEditOrTouch, [false, true, true, true]],
] as const)(
  '%s evaluates interaction state and gives the node override precedence',
  (policy, expected) => {
    const check = createErrorVisibilityChecker(policy);
    const states = [
      undefined,
      { [FieldNodeState.Edited]: true },
      { [FieldNodeState.Touched]: true },
      { [FieldNodeState.Edited]: true, [FieldNodeState.Touched]: true },
    ];
    expect(states.map(check)).toEqual(expected);
    for (const state of states) {
      expect(check({ ...state, [FieldNodeState.ErrorVisibility]: true })).toBe(
        true,
      );
      expect(check({ ...state, [FieldNodeState.ErrorVisibility]: false })).toBe(
        false,
      );
      expect(
        check({ ...state, [FieldNodeState.ErrorVisibility]: undefined }),
      ).toBe(check(state));
    }
  },
);
