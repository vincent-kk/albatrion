import type { Ajv } from 'ajv';
import { resolve } from 'uri-js';

/** Strict ASCII HTTP roots with an explicit path need no native normalization. */
const canonicalHttpAddress =
  /^https?:\/\/[a-z][a-z0-9.-]*\/[A-Za-z0-9_~/-]*(?![\s\S])/;

/**
 * Resolve addresses with the same URI library and trailing-fragment policy as native AJV6.
 * @param _source - Application profile retained for the common compiler helper signature.
 * @param base - Nearest enclosing resource address.
 * @param address - Authored id, reference or fragment to normalize.
 * @returns The native normalized address with an empty trailing fragment removed.
 */
export const resolveAddress = (
  _source: Ajv,
  base: string,
  address: string,
): string =>
  !base && canonicalHttpAddress.test(address)
    ? address
    : resolve(base, address.replace(/#\/?$/, '')).replace(/#\/?$/, '');
