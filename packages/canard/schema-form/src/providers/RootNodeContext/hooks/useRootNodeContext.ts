import { useContext } from 'react';

import { RootNodeContext } from '../components/RootNodeContext';

export const useRootNodeContext = () => useContext(RootNodeContext);
