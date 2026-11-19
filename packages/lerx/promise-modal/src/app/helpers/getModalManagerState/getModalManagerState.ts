import type { ModalManagerState } from '../../types/ModalManagerState';
import { createModalManagerState } from './helpers/createModalManagerState';

/** Global symbol registration joins compatible package copies in this realm. */
const registryKey = Symbol.for('@lerx/promise-modal');
/** Update when the runtime state shape or callback contracts become incompatible. */
const STATE_VERSION = 1;
/** One evaluated copy retains its private fallback when another version owns the slot. */
let localState: ModalManagerState | undefined;

/**
 * Reads the runtime-owned registry once for each evaluated manager module.
 * @returns Compatible shared state, or private state when the registry conflicts.
 * Incompatible registries remain untouched and produce a development warning.
 */
export function getModalManagerState(): ModalManagerState {
  if (localState) return localState;
  const registry = globalThis as typeof globalThis & {
    [registryKey]?: ModalManagerState;
  };
  const existing = registry[registryKey];
  if (existing?.version === STATE_VERSION) return (localState = existing);
  const state = createModalManagerState(STATE_VERSION);
  if (existing === undefined) registry[registryKey] = state;
  else {
    state.isIsolated = true;
    if (process.env.NODE_ENV !== 'production')
    console.warn(
      `[promise-modal] Incompatible global state version ${existing?.version}; expected ${STATE_VERSION}. This incompatible package copy cannot initialize a modal Provider.`,
    );
  }
  return (localState = state);
}
