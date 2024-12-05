import { useContext } from 'react';

import { RootNodeContext } from './RootNodeContext';

export const useRootNodeContext = () => {
  return useContext(RootNodeContext);
};
