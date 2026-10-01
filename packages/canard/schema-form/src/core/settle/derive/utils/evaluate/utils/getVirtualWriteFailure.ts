import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../../../blueprint';
import type { DeriveRoundDecision } from '../../../type';

/**
 * Reject an automatic virtual replacement that cannot fan out to its fields.
 * @param sourcePath - Fired rule occurrence
 * @param schemaPath - Authored rule location
 * @param targetPath - Addressed virtual occurrence
 * @param template - Target's analyzed kind and referenced field list
 * @param value - Candidate replacement
 * @returns Deferred write-shape failure, or none for an admissible value
 */
export const getVirtualWriteFailure = (
  sourcePath: string, schemaPath: string, targetPath: string,
  template: BlueprintNode, value: unknown,
): DeriveRoundDecision<unknown>['failure'] => {
  if (template.kind !== 'virtual' || value === undefined ||
    isArray(value) && value.length === template.fields?.length) return undefined;
  return { sourcePath, schemaPath, targetPath, cause: value,
    kind: 'writeShape', expectedLength: template.fields?.length };
};
