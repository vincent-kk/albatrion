import { type FieldNode, FieldNodeState } from '@/schema-form/core';
import { ErrorVisibility } from '@/schema-form/types';

/**
 * Build a state-first eligibility predicate without changing node state.
 * @param policy - Resolved string policy; undefined selects the default.
 * @returns A pure condition; node overrides precede interaction requirements.
 */
export const createErrorVisibilityChecker =
  (policy: unknown) =>
  (state?: FieldNode['state']): boolean => {
    const override = state?.[FieldNodeState.ErrorVisibility];
    if (override !== undefined) return override;
    switch (policy) {
      case ErrorVisibility.Always:
        return true;
      case ErrorVisibility.Never:
        return false;
      case ErrorVisibility.AfterEdit:
        return !!state?.[FieldNodeState.Edited];
      case ErrorVisibility.AfterTouch:
        return !!state?.[FieldNodeState.Touched];
      case ErrorVisibility.AfterEditOrTouch:
        return !!(
          state?.[FieldNodeState.Edited] || state?.[FieldNodeState.Touched]
        );
      default:
        return !!(
          state?.[FieldNodeState.Edited] && state?.[FieldNodeState.Touched]
        );
    }
  };
