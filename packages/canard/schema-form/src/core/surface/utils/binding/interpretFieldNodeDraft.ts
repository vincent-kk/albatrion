import { isArray } from '@winglet/common-utils/filter';

import { interpret, isMember } from '../../../engine';
import type { SchemaTypeName } from '../../../engine';
import type { FieldNode } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Interpret a draft against the node's current effective types without writing.
 * @param node - Public node supplying authored and effective type restrictions
 * @param draft - Uncommitted input; undefined is the clearing value
 * @returns Interpreted value and whether it belongs to the effective restriction
 */
export const interpretFieldNodeDraft = (
  node: FieldNode,
  draft: unknown,
): { value: unknown; isMember: boolean } => {
  const authored = isArray(node.schemaType)
    ? node.schemaType
    : [node.schemaType];
  const schema = node.jsonSchema;
  const type =
    typeof schema === 'object' && schema !== null ? schema.type : undefined;
  const effective = isArray(type)
    ? type
    : type === undefined
      ? authored
      : [type];
  const kinds: Exclude<SchemaTypeName, 'null'>[] = [];
  for (let index = 0, length = authored.length; index < length; index++) {
    if (!(index in authored)) continue;
    const kind = authored[index];
    if (kind !== undefined && kind !== 'null' && effective.indexOf(kind) !== -1)
      kinds.push(kind);
  }
  const value = interpret(draft, { kinds, mask: 0, nullable: node.nullable });
  return {
    value,
    isMember:
      value === undefined ||
      (value === null
        ? node.nullable
        : (() => {
            const items = kinds;
            for (let index = 0, count = items.length; index < count; index++) {
              if (!(index in items)) continue;
              const kind = items[index];
              if (isMember(value, kind)) return true;
            }
            return false;
          })()),
  };
};
