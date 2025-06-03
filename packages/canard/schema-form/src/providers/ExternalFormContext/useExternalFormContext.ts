import { useContext } from 'react';

import { ExternalFormContext } from './ExternalFormContext';

export const useExternalFormContext = () => useContext(ExternalFormContext);
