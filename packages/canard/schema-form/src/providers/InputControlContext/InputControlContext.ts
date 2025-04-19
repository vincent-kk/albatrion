import { createContext } from 'react';

export interface InputControlContextProps {
  readOnly?: boolean;
  disabled?: boolean;
}

export const InputControlContext = createContext<InputControlContextProps>(
  {} as InputControlContextProps,
);
