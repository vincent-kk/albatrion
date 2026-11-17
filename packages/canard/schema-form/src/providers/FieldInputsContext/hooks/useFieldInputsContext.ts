import { useContext } from 'react';

import { FieldInputsContext } from '../components/FieldInputsContext';

export const useFieldInputsContext = () => useContext(FieldInputsContext);
