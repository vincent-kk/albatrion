import { TYPE_MISMATCH } from '../../../../errors';
import type { SchemaNodeRecord, TypeMismatchRecord } from '../../../record';
import { conversionCandidates } from '../commit/conversionCandidates';
import { effectiveType } from '../commit/effectiveType';
import { isTypeMismatch } from '../commit/isTypeMismatch';
import { receivedType } from '../commit/receivedType';

/**
 * Prepare a first-load mismatch in the same post-order finalization visit.
 * @param node - Occurrence with final raw, schema and output
 * @param automatic - Whether a literal default supplied this source
 * @returns Warning data, or undefined without allocating warning storage
 */
export const readStaticFirstWarning = <Self extends SchemaNodeRecord<Self>>(
  node: Self, automatic: boolean,
): TypeMismatchRecord | undefined => {
  const effective = effectiveType(node);
  if (!isTypeMismatch(node.raw, effective, node.nullable)) return undefined;
  const candidates = conversionCandidates(node, effective);
  const ambiguous = candidates.length > 1;
  return { level: 'warning', code: TYPE_MISMATCH, path: node.path,
    expected: { schemaType: node.schemaType, nullable: node.nullable, effective },
    received: receivedType(node.raw), reason: ambiguous ? 'ambiguous' : 'unconvertible',
    ...(ambiguous ? { candidates } : {}), source: automatic ? 'fill' : 'load' };
};
