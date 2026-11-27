import { useContext } from 'react';

import { ExternalInputContext } from '../components/ExternalInputContext';

/** @returns Input definitions and frame from the nearest provider, or empty settings. */
export const useExternalInputContext = () => useContext(ExternalInputContext);
