import { normalizeId, resolveUrl } from 'ajv/dist/compile/resolve.js';

import type { AjvInstance as Ajv } from '../../types/AjvInstance';

/**
 * Resolve resource addresses with the bound AJV version's URI policy.
 * @param source - Application dialect providing the native URI resolver.
 * @param base - Nearest enclosing resource address.
 * @param address - Authored id, reference or fragment to normalize.
 * @returns The native normalized address with an empty trailing fragment removed.
 */
export const resolveAddress = (
  _source: Ajv,
  base: string,
  address: string,
): string => normalizeId(resolveUrl(base, address));
