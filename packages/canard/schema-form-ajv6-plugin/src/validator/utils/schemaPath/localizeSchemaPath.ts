import type { SchemaResource } from './collectSchemaResources';

/**
 * Resolves the local resource prefix in a native error path.
 * @param path - Native schema path outside the root fragment.
 * @param resources - Compiled resources in longest identifier order.
 * @returns The matching resource and its fragment path, when proven local.
 */
export const localizeSchemaPath = (path: string, resources: readonly SchemaResource[]) => {
  for (const { id, schema } of resources) {
    if (!path.startsWith(id)) continue;
    const suffix = path.slice(id.length);
    if (suffix.startsWith('#/')) return { schema, path: suffix };
    if (suffix.startsWith('/')) return { schema, path: '#' + suffix };
  }
};
