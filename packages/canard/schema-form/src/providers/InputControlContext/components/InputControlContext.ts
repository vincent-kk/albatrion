import { type RefObject, createContext } from 'react';

export interface InputControlContext {
  /** Committed form locks shared by callbacks from every live input. */
  controlRef: RefObject<Pick<InputControlContext, 'readOnly' | 'disabled'>>;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export const InputControlContext = createContext<InputControlContext>({
  controlRef: { current: {} },
});
