import type { Optional } from '@aileron/declare';

import { FormWarningCode } from '../../../../../../errors';
import type { FieldNodeRecord, MisfitRecord } from '../../../../record';
import { conversionCandidates } from '../../../utils/commit/conversionCandidates';
import { effectiveType } from '../../../utils/commit/effectiveType';
import { isMisfit } from '../../../utils/commit/isMisfit';
import { receivedType } from '../../../utils/commit/receivedType';

/**
 * Prepare a first-load mismatch in the same post-order finalization visit.
 * @param node - Occurrence with final raw, schema and output
 * @param automatic - Whether a literal default supplied this source
 * @returns Warning data, or undefined without allocating warning storage
 */
export const readStaticFirstWarning = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  automatic: boolean,
): Optional<MisfitRecord> => {
  const schemaType = node.schemaType;
  const effective = effectiveType(node);
  // Only a virtual node lacks a JSON type, and it never misfits.
  if (schemaType === undefined || effective === undefined) return undefined;
  if (!isMisfit(node.raw, effective, node.nullable)) return undefined;
  const candidates = conversionCandidates(node, effective);
  const ambiguous = candidates.length > 1;
  return {
    level: 'warning',
    code: FormWarningCode.Misfit,
    path: node.path,
    expected: {
      schemaType,
      nullable: node.nullable,
      effective,
    },
    received: receivedType(node.raw),
    reason: ambiguous ? 'ambiguous' : 'unconvertible',
    ...(ambiguous ? { candidates } : {}),
    source: automatic ? 'fill' : 'load',
  };
};
