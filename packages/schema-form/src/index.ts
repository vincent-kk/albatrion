import { common } from '@common';
import { foo } from '@schema-form/foo';

export const schemaForm = () => {
  return common() + ' from schemaForm' + foo();
};
