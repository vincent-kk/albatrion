import {
  JSONPointer,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { DeriveRoundDecision } from '../../../../derive';
import type { FieldNodeRecord } from '../../../../record';
import { resolveVirtualStorageTargets } from '../../../../utils/paths/resolveVirtualStorageTargets';

/**
 * Read the storage addresses one automatic write replaces.
 * @param write - Winner from derive's decision, live or latent
 * @returns The constituent addresses of a virtual group target, otherwise the target path alone
 */
export const readWriteAddresses = <Self extends FieldNodeRecord<Self>>(
  write: DeriveRoundDecision<Self>['writes'][number],
): string[] => {
  const template = write.target ? write.target.blueprintNode : write.template;
  if (template?.kind !== 'virtual') return [write.targetPath];
  const host = resolvePointer(write.targetPath, JSONPointer.Parent);
  return resolveVirtualStorageTargets(host, template.fields).map(({ path }) => path);
};
