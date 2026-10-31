import type { Dictionary, Nullable, Optional } from '@aileron/declare';

import type {
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintSchemaType,
  EffectiveSchema,
} from '../../blueprint';
import type { NodeStateFlags } from '../../types/state';
import type { Behavior } from './behavior';
import type { FieldNodeRuntime } from './runtime';
import type {
  InactiveSlotBaseline,
  InactiveSlotOverlay,
  InactiveSlotValueMemo,
} from './slots';

/** One pending node event with values indexed by their event bits. */
export interface FieldNodeDelivery {
  /** Combined event bits waiting for dispatch. */
  type: number;
  /** Latest event-specific values for this wave. */
  payload?: Partial<Record<number, unknown>>;
  /** Latest event-specific metadata for this wave. */
  options?: Partial<Record<number, unknown>>;
}

/** The fixed node layout implemented by every node kind. */
export interface FieldNodeRecord<Self> {
  /** Shared calculation row selected for this node's kind and strategy. */
  readonly behavior: Behavior<Self>;
  /** Per-tree services and settlement records. */
  readonly runtime: FieldNodeRuntime<Self>;
  /** Immutable analysis template for this occurrence. */
  readonly blueprintNode: BlueprintNode;
  /** Current structural parent, absent only at the root. */
  parent: Nullable<Self>;
  /** Live root, including when this node has detached. */
  rootNode: Self;
  /** Unescaped name within the parent. */
  name: string;
  /** JSON Pointer encoded name within the parent. */
  escapedName: string;
  /** Canonical absolute path of this occurrence. */
  path: string;
  /** Settlement generation marking this occurrence for a static whole write. */
  writeEpoch?: number;
  /** Number of structural edges from the root. */
  depth: number;
  /** Whether the current declaration requires this node. */
  required: boolean;
  /** Whether the fixed type permits null. */
  readonly nullable: boolean;
  /** Stable JSON type restriction retained from blueprint analysis; undefined on virtual nodes. */
  readonly schemaType: Optional<BlueprintSchemaType>;
  /** Direct children in the last committed shape, keyed by their names. */
  structure: Nullable<Dictionary<Self>>;
  /** Stored public child array for the last committed shape. */
  children: Nullable<readonly Self[]>;
  /** Previously active occurrences retained by their exact blueprint binding. */
  inactiveSlots?: Map<BlueprintChildEntry, Self>;
  /** Immutable missing-child inputs and source exclusions at this occurrence's exit. */
  retainedSourceOverlay?: InactiveSlotOverlay;
  /** Host-owned source patches that never mutate retained public references. */
  inactiveSlotOverlays?: Map<BlueprintChildEntry, InactiveSlotOverlay>;
  /** Pre-change sources retained until a live host publishes its next commit. */
  inactiveSlotBaselines?: Map<BlueprintChildEntry, InactiveSlotBaseline<Self>>;
  /** Owned active child hosts with retained descendants, excluding unrelated siblings. */
  inactiveSlotChildren?: Map<string, Self>;
  /** Frozen materialization for this reference's committed inactive sources. */
  inactiveValuesCache?: readonly { path: string; value: unknown }[];
  /** Whether a committed slot or descendant change invalidated this host read. */
  inactiveValuesDirty?: boolean;
  /** Last item published from this inactive lifetime; absent on active clones. */
  inactiveValueMemo?: InactiveSlotValueMemo;
  /** Last-live explicit keep/clear decision; an own undefined means inheritance. */
  retainedExitPolicy?: boolean;
  /** Creation-order nonce for an array item, absent on other nodes. */
  itemKey: Nullable<number>;
  /** Number of array host positions, including positions without templates. */
  itemCount: number;
  /** Next creation-order nonce owned by an array host. */
  nextItemKey: number;
  /** Interpreted terminal source or a branch's non-plain source. */
  raw: unknown;
  /** Undeclared object keys retained in their incoming own-key order. */
  undeclaredValues: unknown;
  /** Result of the current node gate. */
  active: boolean;
  /** Local visibility after all active state declarations are combined. */
  visible: boolean;
  /** Local read-only result, including standard schema readOnly. */
  readOnly: boolean;
  /** Local disabled result after all active state declarations are combined. */
  disabled: boolean;
  /** Calculated local value before output projection. */
  local: unknown;
  /** Calculated output value. */
  emit: unknown;
  /** Merged effective schema for the active declarations. */
  schema: EffectiveSchema;
  /** Stored interaction flags updated by shallow patches. */
  interactionState: NodeStateFlags;
  /** First pre-verdict eligibility record, released at settle or after a quiet paint. */
  revealBaseline?: {
    readonly state: NodeStateFlags;
    readonly enabled: boolean;
  };
  /** Per-bit commit counts, allocated on the first delivery. */
  revisionLedger: Readonly<Record<number, number>>;
  /** Whether this occurrence has completed its initial delivery comparison. */
  deliveryInitialized: boolean;
  /** Event kinds with first-change baselines pending this commit. */
  deliveryChanges: number;
  /** Value/output identities at the first value change in this commit. */
  deliveryPreviousLocal?: unknown;
  deliveryPreviousEmit?: unknown;
  /** Address before this commit's first rekey. */
  deliveryPreviousPath?: string;
  /** Child identity collection before the first shape change. */
  deliveryPreviousChildren?: Nullable<readonly Self[]>;
  /** Packed active/visible/readOnly/disabled values before their first change. */
  deliveryPreviousComputed?: number;
  /** Effective schema identity before this commit's first schema change. */
  deliveryPreviousSchema?: EffectiveSchema;
  /** Interaction state before settlement clears or patches it. */
  deliveryPreviousState?: NodeStateFlags;
  /** Last compared watch values, present only on declared watch targets. */
  deliveryWatchValues?: readonly unknown[];
  /** Event bits and immutable payloads awaiting the next settlement wave. */
  pendingDelivery?: FieldNodeDelivery;
  /** Bits to advance once at this commit, independently of listeners. */
  pendingRevision: number;
  /** State and command events awaiting their separate wave. */
  pendingNonSettleDelivery?: FieldNodeDelivery;
  /** Whether this reference has left the live shape. */
  detached: boolean;
  /** Retired by binding adoption; reads retain the preceding commit. */
  disposed: boolean;
  /** Monotone interaction lifetime, independent of event delivery. */
  interactionReset: number;
}
