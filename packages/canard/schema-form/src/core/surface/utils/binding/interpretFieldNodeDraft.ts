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
    const kind = authored[index];
    if (kind !== undefined && kind !== 'null' && effective.indexOf(kind) !== -1)
      kinds.push(kind);
  }
  const value = interpret(draft, { kinds, mask: 0, nullable: node.nullable });
  let matchesEither = value === undefined;
  if (!matchesEither) {
    let selectedResult: boolean;
    if (value === null) {
      selectedResult = node.nullable;
    } else {
      let hasMatch = false;
      for (let index = 0, count = kinds.length; index < count; index++) {
        const kind = kinds[index];

        if (isMember(value, kind)) {
          hasMatch = true;
          break;
        }
      }
      selectedResult = hasMatch;
    }
    matchesEither = selectedResult;
  }
  return {
    value,
    isMember: matchesEither,
  };
};
