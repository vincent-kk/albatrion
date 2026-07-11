import { useContext } from 'react';

import { VirtualizationContext } from './VirtualizationContext';

export const useVirtualizationContext = () => useContext(VirtualizationContext);
