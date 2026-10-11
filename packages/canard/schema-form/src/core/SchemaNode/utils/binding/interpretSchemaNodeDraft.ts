import { isArray } from '@winglet/common-utils/filter';

import { interpret, isMember } from '../../../behaviors';
import type { SchemaTypeName } from '../../../blueprint';
import type { SchemaNode } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Interpret a draft against the node's current effective types without writing.
 * @param node - Public node supplying authored and effective type restrictions
 * @param draft - Uncommitted input; undefined is the clearing value
 * @returns Interpreted value and whether it belongs to the effective restriction
 */
export const interpretSchemaNodeDraft = (
  node: SchemaNode, draft: unknown,
): { value: unknown; isMember: boolean } => {
  const authored = isArray(node.schemaType) ? node.schemaType : [node.schemaType];
  const schema = node.jsonSchema;
  const type = typeof schema === 'object' && schema !== null ? schema.type : undefined;
  const effective = isArray(type) ? type : type === undefined ? authored : [type];
  const kinds = authored.filter((kind): kind is Exclude<SchemaTypeName, 'null'> =>
    kind !== 'virtual' && kind !== 'null' && effective.includes(kind));
  const value = interpret(draft, { kinds, mask: 0, nullable: node.nullable });
  return {
    value,
    isMember: value === undefined || (value === null ? node.nullable :
      kinds.some((kind) => isMember(value, kind))),
  };
};
