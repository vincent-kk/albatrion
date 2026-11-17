import {
  type PropsWithChildren,
  useInsertionEffect,
  useMemo,
  useRef,
} from 'react';

import { InputControlContext } from './InputControlContext';

interface InputControlContextProviderProps {
  /** Apply readOnly property to all FieldInput components */
  readOnly?: boolean;
  /** Apply disabled property to all FieldInput components */
  disabled?: boolean;
}

export const InputControlContextProvider = ({
  readOnly,
  disabled,
  children,
}: PropsWithChildren<InputControlContextProviderProps>) => {
  const committedLockRef = useRef({ readOnly, disabled });
  // Publish before child layout setup without leaking uncommitted render values.
  useInsertionEffect(() => {
    committedLockRef.current = { readOnly, disabled };
  }, [readOnly, disabled]);
  const value = useMemo(
    () => ({ readOnly, disabled, committedLockRef }),
    [readOnly, disabled],
  );
  return (
    <InputControlContext.Provider value={value}>
      {children}
    </InputControlContext.Provider>
  );
};
