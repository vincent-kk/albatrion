import type { InteractionStateNames } from '@aileron/schema-form-scenarios';

import { FieldNodeState } from '../../../src';

/**
 * Translate a global state record into flag names, keeping only keys whose value is true.
 * @param state - The handle's getState() result or an onStateChange argument, keyed by FieldNodeState flags.
 * @returns The same state keyed by dirty, touched, and showError.
 */
export function readStateNames(state: Readonly<Record<string, boolean | undefined>>): InteractionStateNames {
  return {
    ...(state[FieldNodeState.Dirty] && { dirty: true }),
    ...(state[FieldNodeState.Touched] && { touched: true }),
    ...(state[FieldNodeState.ErrorVisible] && { showError: true }),
  };
}
