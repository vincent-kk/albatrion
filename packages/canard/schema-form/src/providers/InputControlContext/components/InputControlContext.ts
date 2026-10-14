import { createContext } from 'react';

export interface InputControlContext {
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export const InputControlContext = createContext<InputControlContext>(
  {} as InputControlContext,
);
