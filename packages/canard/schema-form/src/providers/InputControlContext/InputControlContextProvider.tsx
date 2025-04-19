import { type PropsWithChildren, useMemo } from 'react';

import { InputControlContext } from './InputControlContext';

interface InputControlContextProviderProps {
  /** FormTypeInput 전체에 readOnly 속성 적용 */
  readOnly?: boolean;
  /** FormTypeInput 전체에 disabled 속성 적용 */
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
