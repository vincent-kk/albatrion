import { type PropsWithChildren, useMemo } from 'react';

import { InputControlContext } from './InputControlContext';

interface InputControlContextProviderProps {
  /** Apply readOnly property to all FormTypeInput components */
  readOnly?: boolean;
  /** Apply disabled property to all FormTypeInput components */
  disabled?: boolean;
}

export const InputControlContextProvider = ({
  readOnly,
  disabled,
  children,
}: PropsWithChildren<InputControlContextProviderProps>) => {
  const value = useMemo(() => ({ readOnly, disabled }), [readOnly, disabled]);
  return (
    <InputControlContext.Provider value={value}>
      {children}
    </InputControlContext.Provider>
  );
};
