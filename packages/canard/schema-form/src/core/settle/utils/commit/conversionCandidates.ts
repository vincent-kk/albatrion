import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { isTypeMismatch } from './isTypeMismatch';

/**
 * Find scalar conversions that could admit a currently mismatched raw value.
 * @param node - Node whose row supplies the same conversion rule as marking
 * @param effective - Current gated type list
 * @returns Converted kind names in effective-list order
 */
export const conversionCandidates = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  effective: BlueprintSchemaType,
): Exclude<SchemaTypeName, 'null'>[] => {
  const kinds = typeof effective === 'string' ? [effective] : effective;
  const candidates: Exclude<SchemaTypeName, 'null'>[] = [];
  for (const kind of kinds) {
    if (kind === 'null' || kind === 'virtual') continue;
    const converted = node.behavior.interpret(node.raw,
      { kinds: kind, mask: 0, nullable: node.nullable });
    if (!Object.is(converted, node.raw) &&
      !isTypeMismatch(converted, kind, node.nullable))
      candidates.push(kind);
  }
  return candidates;
};
