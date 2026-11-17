import { type RefObject, createContext } from 'react';

export interface InputControlContext {
  /** Committed readOnly-or-disabled lock shared by every live input callback. */
  committedLockRef: RefObject<boolean>;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export const InputControlContext = createContext<InputControlContext>({
  committedLockRef: { current: false },
});
