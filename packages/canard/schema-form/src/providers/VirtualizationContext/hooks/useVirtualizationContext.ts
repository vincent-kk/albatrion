import { useContext } from 'react';

import { VirtualizationContext } from '../components/VirtualizationContext';

export const useVirtualizationContext = () => useContext(VirtualizationContext);
