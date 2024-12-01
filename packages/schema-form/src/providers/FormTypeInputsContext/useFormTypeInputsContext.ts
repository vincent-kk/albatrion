import { useContext } from 'react';

import { FormTypeInputsContext } from './FormTypeInputsContext';

export const useFormTypeInputsContext = () => {
  return useContext(FormTypeInputsContext);
};
