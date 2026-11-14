import { useContext } from 'react';

import { ExternalFormContext } from '../components/ExternalFormContext';

export const useExternalFormContext = () => useContext(ExternalFormContext);
