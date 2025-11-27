import type { UnknownSchema } from '../types/jsonSchema';

export const isSameSchemaType = (left: UnknownSchema, right: UnknownSchema) => {
  const leftType = left.type,
    rightType = right.type;
  if (leftType === undefined || rightType === undefined) return false;
  if (leftType === rightType) return true;
  if (leftType.length !== rightType.length) return false;
  for (let i = 0, l = leftType.length; i < l; i++)
    if (rightType.indexOf(leftType[i]) === -1) return false;
  return true;
};
