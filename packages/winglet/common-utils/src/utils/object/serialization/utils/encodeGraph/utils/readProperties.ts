import type { Token, TraversalState } from '../type';
import { toToken } from './toToken';

/** Reads retained own data descriptors in traversal order without invoking getters. */
export function readProperties(
  value: object,
  state: TraversalState,
): [string, Token][] {
  const keys = Object.keys(value);
  if (state.options.sorted) keys.sort();
  const entries: [string, Token][] = [];
  const omit = state.options.omit;
  for (const key of keys) {
    if (
      omit &&
      (Array.isArray(omit)
        ? omit.includes(key)
        : (omit as ReadonlySet<string>).has(key))
    )
      continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor))
      throw new TypeError(`Unsupported accessor at ${JSON.stringify(key)}`);
    if (++state.entries > 1000000)
      throw new TypeError('Graph entry limit exceeded');
    try {
      entries.push([key, toToken(descriptor.value, state)]);
    } catch (error) {
      throw new TypeError(
        `Invalid graph property ${JSON.stringify(key)}: ${String(error)}`,
      );
    }
  }
  return entries;
}
