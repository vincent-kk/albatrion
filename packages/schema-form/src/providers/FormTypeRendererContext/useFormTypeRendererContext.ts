import { useContext } from 'react';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  return useContext(FormTypeRendererContext);
};
