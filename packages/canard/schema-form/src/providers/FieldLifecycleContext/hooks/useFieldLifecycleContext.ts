import { useContext } from 'react';

import { FieldLifecycleContext } from '../components/FieldLifecycleContext';

/**
 * Read the registry supplied by React's nearest lifecycle Context provider.
 * @returns The current form's registry, or null for an input outside a Form.
 */
export const useFieldLifecycleContext = () => useContext(FieldLifecycleContext);
