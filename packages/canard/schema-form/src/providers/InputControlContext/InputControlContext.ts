import { createContext } from 'react';

export interface InputControlContext {
  readOnly?: boolean;
  disabled?: boolean;
}

export const InputControlContext = createContext<InputControlContext>(
  {} as InputControlContext,
);
