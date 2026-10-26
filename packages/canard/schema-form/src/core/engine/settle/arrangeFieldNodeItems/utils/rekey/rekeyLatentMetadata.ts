import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRuntime } from '../../../../record';
import { DetachedWriteAddress } from '../../../utils/latentStore/DetachedWriteAddress';

/**
 * Adjust latent occurrence order together with its moved absolute path.
 * @param metadata - Classification metadata belonging to the previous key
 * @param path - New absolute latent path
 * @param previous - Old absolute latent path
 * @param hostPath - Structurally edited array host
 * @returns Metadata at the surviving position, preserving other order slots
 */
export const rekeyLatentMetadata = <Self>(
  metadata: NonNullable<
    FieldNodeRuntime<Self>['latentRawMetadata']
  > extends Map<string, infer Value>
    ? Value
    : never,
  path: string,
  previous: string,
  hostPath: string,
) => {
  const position = hostPath === '' ? 0 : hostPath.split($.Separator).length - 1;
  const order = [...metadata.order];
  if (previous !== path && order.length > position)
    order[position] = Number(
      path.slice(hostPath.length + 1).split($.Separator)[0],
    );
  const current = { ...metadata, path, order };
  DetachedWriteAddress.transfer(metadata, current);
  return current;
};
