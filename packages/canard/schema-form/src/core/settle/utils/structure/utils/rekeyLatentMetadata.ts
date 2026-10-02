import type { SchemaNodeRuntime } from '../../../../record';

/**
 * Adjust latent occurrence order together with its moved absolute path.
 * @param metadata - Classification metadata belonging to the previous key
 * @param path - New absolute latent path
 * @param previous - Old absolute latent path
 * @param hostPath - Structurally edited array host
 * @returns Metadata at the surviving position, preserving other order slots
 */
export const rekeyLatentMetadata = <Self>(
  metadata: NonNullable<SchemaNodeRuntime<Self>['latentRawMetadata']> extends
    Map<string, infer Value> ? Value : never,
  path: string, previous: string, hostPath: string,
) => {
  const position = hostPath === '' ? 0 : hostPath.split('/').length - 1;
  const order = [...metadata.order];
  if (previous !== path && order.length > position)
    order[position] = Number(path.slice(hostPath.length + 1).split('/')[0]);
  return { ...metadata, path, order };
};
