import { useContext } from 'react';

import { UserDefinedContext } from './UserDefinedContext';

export const useUserDefinedContext = () => {
  return useContext(UserDefinedContext);
};
