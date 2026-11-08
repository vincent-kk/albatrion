import { useContext } from 'react';

import { FieldLifecycleContext } from '../components/FieldLifecycleContext';

/** Read the current form's registry; null permits an input position outside a Form. */
export const useFieldLifecycleContext = () => useContext(FieldLifecycleContext);
