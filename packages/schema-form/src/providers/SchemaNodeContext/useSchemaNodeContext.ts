import { useContext } from 'react';

import { SchemaNodeContext } from './SchemaNodeContext';

export const useSchemaNodeContext = () => {
  return useContext(SchemaNodeContext);
};
