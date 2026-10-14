import { useContext } from 'react';

import { FormErrorContext } from './FormErrorContext';

/** Read the optional instance reporter at the consuming render boundary. */
export const useFormErrorContext = () => useContext(FormErrorContext);
