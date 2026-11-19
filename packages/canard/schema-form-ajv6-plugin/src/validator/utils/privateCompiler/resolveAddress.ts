import type { Ajv } from 'ajv';
import { resolve } from 'uri-js';

/**
 * Resolve addresses with the same URI library and trailing-fragment policy as native AJV6.
 * @param source - Application dialect providing the native URI resolver.
 * @param base - Nearest enclosing resource address.
 * @param address - Authored id, reference or fragment to normalize.
 * @returns The native normalized address with an empty trailing fragment removed.
 */
export const resolveAddress = (
  _source: Ajv,
  base: string,
  address: string,
): string => resolve(base, address.replace(/#\/?$/, '')).replace(/#\/?$/, '');
