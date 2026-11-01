import { CONTROL_KEY } from '../../../constants/controlKey';
import type { ChildControlKey } from '../../../types/controls';

/** Control keys whose string value is a compiled expression, in compilation order. */
export const EXPRESSION_CONTROL_KEYS = [
  CONTROL_KEY.active,
  CONTROL_KEY.visible,
  CONTROL_KEY.readOnly,
  CONTROL_KEY.disabled,
  CONTROL_KEY.unsetOnInactive,
  CONTROL_KEY.derived,
  CONTROL_KEY.unsetValue,
  CONTROL_KEY.resetInteraction,
] as const satisfies readonly ChildControlKey[];
