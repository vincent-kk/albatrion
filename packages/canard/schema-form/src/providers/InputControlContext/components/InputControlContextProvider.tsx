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
  const isLocked = !!(readOnly || disabled);
  const committedLockRef = useRef(isLocked);
  // Publish before child layout setup without leaking uncommitted render values.
  useInsertionEffect(() => {
    committedLockRef.current = isLocked;
  }, [isLocked]);
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
