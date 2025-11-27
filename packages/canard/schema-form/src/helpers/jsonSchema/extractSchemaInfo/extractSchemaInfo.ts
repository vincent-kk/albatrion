import { isArray } from '@winglet/common-utils/filter';

import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

type Return = {
  type: JsonSchemaType;
  nullable: boolean;
};

export const extractSchemaInfo = <
  Schema extends {
    type?: JsonSchemaWithVirtual['type'];
    nullable?: boolean;
  },
>(
  jsonSchema: Schema,
) => {
  const type = jsonSchema.type;
  if (type === undefined) return null;
  if (isArray(type)) {
    if (type.length === 0 || type.length > 2) return null;
    if (type.length === 1)
      return { type: type[0], nullable: type[0] === 'null' } as Return;
    const nullIndex = type.indexOf('null');
    if (nullIndex === -1) return null;
    return { type: type[nullIndex === 0 ? 1 : 0], nullable: true } as Return;
  }
  return {
    type,
    nullable: type === 'null' || jsonSchema.nullable === true,
  } as Return;
};
