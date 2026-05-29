import { VOID_FUNCTION } from '@winglet/common-utils/constant';

import type { Fn } from '@aileron/declare';

import type { ComputedProperties } from '../../ComputedPropertiesManager/type';

/** Frozen, shared empty arrays for the sentinel (read-only consumers only). */
const SENTINEL_NUMBERS = Object.freeze<number[]>([]) as number[];
const SENTINEL_VALUES = Object.freeze<unknown[]>([]) as unknown[];
const SENTINEL_PATHS = Object.freeze<string[]>([]) as string[];

/**
 * Process-wide stand-in returned for nodes with NO computed/conditional schema
 * (see `needsRealComputedManager`). Holds the same defaults a fresh
 * `ComputedPropertiesManager` would have for a plain node, so every
 * `__computeManager__` read site stays correct without constructing a real
 * manager (which would allocate a PathManager, ~9 factory closures and a
 * dependencies array per node).
 *
 * Safe to share a single frozen instance: `recalculate()` is a no-op, the only
 * array index-writes in the tree are gated behind `isEnabled` (false here), and
 * all consumers of the arrays are read-only. Frozen so an accidental future
 * write throws loudly instead of silently corrupting every plain node.
 */
export const sharedComputedSentinel: ComputedProperties = Object.freeze({
  active: true,
  visible: true,
  readOnly: false,
  disabled: false,
  oneOfIndex: -1,
  anyOfIndices: SENTINEL_NUMBERS,
  watchValues: SENTINEL_VALUES,
  dependencyPaths: SENTINEL_PATHS,
  dependencies: SENTINEL_VALUES,
  isPristineDefined: false,
  isDerivedDefined: false,
  hasPostProcessor: false,
  isEnabled: false,
  getDerivedValue: VOID_FUNCTION,
  getPristine: VOID_FUNCTION as Fn<[], undefined>,
  recalculate: VOID_FUNCTION,
});
