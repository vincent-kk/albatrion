import { useContext } from 'react';

import { InputControlContext } from './InputControlContext';

export const useInputControlContext = () => {
  return useContext(InputControlContext);
};
