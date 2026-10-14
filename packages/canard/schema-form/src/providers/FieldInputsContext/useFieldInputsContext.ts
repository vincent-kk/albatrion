import { useContext } from 'react';

import { FieldInputsContext } from './FieldInputsContext';

export const useFieldInputsContext = () => useContext(FieldInputsContext);
