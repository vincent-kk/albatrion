import { JSONPointer as $ } from '../constants/JSONPointer';

/** Read once at load: the check runs per issue on hot clearing paths. */
const SEPARATOR = $.Separator;

/**
 * Tell whether an address is already in the canonical form that node paths use.
 * @param path - Address string; any string is valid.
 * @returns True for a string starting with `/`. The empty string, a `#`-prefixed fragment and relative addresses are not canonical, so a caller must resolve them against a tree first.
 */
export const isCanonicalPath = (path: string): boolean => path[0] === SEPARATOR;
