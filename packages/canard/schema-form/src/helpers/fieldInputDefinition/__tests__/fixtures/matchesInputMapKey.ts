import { normalizeFieldInputMap } from '../../utils/normalizeFieldInputMap';

/**
 * Resolve a key against a string-node hint without rendering an input.
 * @param key - Authored input-map key; invalid explicit patterns throw.
 * @param path - Escaped canonical node path.
 * @returns Whether the normalized matcher selects this node.
 */
export const matchesInputMapKey = (key: string, path: string): boolean =>
  normalizeFieldInputMap({ [key]: () => null })[0].test({
    schemaType: 'string',
    type: 'string',
    path,
    nullable: false,
    required: false,
    misfit: false,
    jsonSchema: { type: 'string' },
  });
