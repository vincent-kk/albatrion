import type { JsonSchema } from '@lumy-form/types';

export const getNodeType = <Schema extends JsonSchema>({ type }: Schema) => {
  if (type === 'number' || type === 'integer')
    return 'number' as Exclude<Schema['type'], 'integer'>;
  else return type as Exclude<Schema['type'], 'integer'>;
};
