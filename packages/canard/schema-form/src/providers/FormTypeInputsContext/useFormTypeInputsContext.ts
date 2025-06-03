import { useContext } from 'react';

import { FormTypeInputsContext } from './FormTypeInputsContext';

export const useFormTypeInputsContext = () => useContext(FormTypeInputsContext);
