import type { EffectiveSchema } from '../../../blueprint';

/** Reusable containers for one non-reentrant synchronous settlement. */
export interface SettlementScratch {
  inUse: boolean;
  /** Storage-only element type; the caller binds each container to its node type. */
  entered: Set<never>;
  exited: Set<never>;
  selectedDeclarationIds: Map<never, readonly number[]>;
  writtenInputs: Map<never, unknown>;
  automaticLog: { node: never; previousRaw: unknown; previousExtras: unknown }[];
  filledNodes: Set<never>;
  latentAutomaticLog: Map<string, { present: boolean; value: unknown }>;
  dirtyPaths: Set<string>;
  shapeDirtyPaths: Set<string>;
  changedRaw: Set<string>;
  explicitRaw: Set<string>;
  changedNodes: Set<never>;
  originalSchemas: Map<string, EffectiveSchema>;
}

/** Runtime lifetime owns work containers; a nested write gets separate containers. */
const SCRATCH = new WeakMap<object, SettlementScratch>();

/**
 * Reuse cleared work containers while preserving nested-write isolation.
 * @param runtime - One tree's root-owned settlement runtime
 * @returns Containers reserved until the caller releases them
 */
export const getSettlementScratch = (runtime: object): SettlementScratch => {
  const cached = SCRATCH.get(runtime);
  const scratch = cached && !cached.inUse ? cached : {
    inUse: false,
    entered: new Set<never>(), exited: new Set<never>(),
    selectedDeclarationIds: new Map<never, readonly number[]>(),
    writtenInputs: new Map<never, unknown>(), automaticLog: [],
    filledNodes: new Set<never>(),
    latentAutomaticLog: new Map<string, { present: boolean; value: unknown }>(),
    dirtyPaths: new Set<string>(), shapeDirtyPaths: new Set<string>(),
    changedRaw: new Set<string>(), explicitRaw: new Set<string>(),
    changedNodes: new Set<never>(),
    originalSchemas: new Map<string, EffectiveSchema>(),
  };
  if (!cached) SCRATCH.set(runtime, scratch);
  scratch.inUse = true;
  return scratch;
};
