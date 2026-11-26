import type { Dictionary, Nullable, Optional } from '@aileron/declare';

import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

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
  __parent__: Nullable<Self>;
  /** Live root, including when this node has detached. */
  rootNode: Self;
  /** Unescaped name within the parent. */
  name: string;
  /** JSON Pointer encoded name within the parent. */
  escapedName: string;
  /** Canonical absolute path of this occurrence. */
  path: string;
  /** Settlement generation marking this occurrence for a static whole write. */
  __writeEpoch__?: number;
  /** Number of structural edges from the root. */
  depth: number;
  /** Whether the current declaration requires this node. */
  isRequired: boolean;
  /** Whether the fixed type permits null. */
  readonly isNullable: boolean;
  /** Stable JSON type restriction retained from blueprint analysis; undefined on virtual nodes. */
  readonly schemaType: Optional<BlueprintSchemaType>;
  /** Direct children in the last committed shape, keyed by their names. */
  __childrenByName__: Nullable<Dictionary<Self>>;
  /** Stored public child array for the last committed shape. */
  children: Nullable<readonly Self[]>;
  /** Previously active occurrences retained by their exact blueprint binding. */
  __inactiveSlots__?: Map<BlueprintChildEntry, Self>;
  /** Immutable missing-child inputs and source exclusions at this occurrence's exit. */
  __retainedSourceOverlay__?: InactiveSlotOverlay;
  /** Host-owned source patches that never mutate retained public references. */
  __inactiveSlotOverlays__?: Map<BlueprintChildEntry, InactiveSlotOverlay>;
  /** Pre-change sources retained until a live host publishes its next commit. */
  __inactiveSlotBaselines__?: Map<
    BlueprintChildEntry,
    InactiveSlotBaseline<Self>
  >;
  /** Owned active child hosts with retained descendants, excluding unrelated siblings. */
  __inactiveSlotChildren__?: Map<string, Self>;
  /** Frozen materialization for this reference's committed inactive sources. */
  __inactiveValues__?: readonly { path: string; value: unknown }[];
  /** Whether a committed slot or descendant change invalidated this host read. */
  __isInactiveValuesDirty__?: boolean;
  /** Last item published from this inactive lifetime; absent on active clones. */
  __inactiveSlotValue__?: InactiveSlotValueMemo;
  /** Last-live explicit keep/clear decision; an own undefined means inheritance. */
  __shouldUnsetOnInactive__?: boolean;
  /** Creation-order nonce for an array item, absent on other nodes. */
  __itemKey__: Nullable<number>;
  /** Number of array host positions, including positions without templates. */
  __itemCount__: number;
  /** Next creation-order nonce owned by an array host. */
  __nextItemKey__: number;
  /** Interpreted terminal source or a branch's non-plain source. */
  source: unknown;
  /** Undeclared object keys retained in their incoming own-key order. */
  extras: unknown;
  /** Result of the current node gate. */
  isActive: boolean;
  /** Local visibility after all active state declarations are combined. */
  isVisible: boolean;
  /** Local read-only result, including standard schema readOnly. */
  isReadOnly: boolean;
  /** Local disabled result after all active state declarations are combined. */
  isDisabled: boolean;
  /** Calculated local value before output projection. */
  __value__: unknown;
  /** Calculated output value. */
  __outputValue__: unknown;
  /** Current output at this occurrence's path when divergence was last read. */
  __divergenceCurrent__: unknown;
  /** Concrete path whose parsed segments this occurrence retains. */
  __divergencePath__: string | undefined;
  /** Parsed path syntax retained until this occurrence changes address. */
  __divergenceSegments__: readonly PointerSegment[] | undefined;
  /** Baseline output at this occurrence's path when divergence was last read. */
  __divergenceBase__: unknown;
  /** Pure comparison result for the two retained path values. */
  __isDivergent__: boolean;
  /**
   * Last default tuple projected for a virtual group, returned again while its length and every
   * element stay `Object.is`-equal to a fresh projection; undefined on other kinds and before the first read.
   */
  __virtualDefaultValue__?: readonly unknown[];
  /**
   * Watch values from this occurrence's last changed read and the commit that read them; a read returns the
   * same array while every value stays `Object.is`-equal, and a detached read returns it unchanged.
   * Undefined until a read meets a watch list; in a tree that declares any watch, an exit replaces it with the
   * departing snapshot's values.
   */
  __watchValues__?: { commit: number; values: readonly unknown[] };
  /** Merged effective schema for the active declarations. */
  __schema__: EffectiveSchema;
  /** Stored interaction flags updated by shallow patches. */
  __state__: NodeStateFlags;
  /** Unreleased pre-change eligibility entries, one per public write sequence, cut by release generation. */
  __revealBaseline__?: {
    entries: {
      readonly state: NodeStateFlags;
      /** Presence before this write's first eligibility change. */
      readonly isPresent: boolean;
      readonly generation: number;
      readonly sequence: number;
    }[];
  };
  /** Per-bit commit counts, allocated on the first delivery. */
  __revisionLedger__: Readonly<Record<number, number>>;
  /** Whether this occurrence has completed its initial delivery comparison. */
  __isDeliveryInitialized__: boolean;
  /** Event kinds with first-change baselines pending this commit. */
  __deliveryChanges__: number;
  /** Value/output identities at the first value change in this commit. */
  __deliveryPreviousValue__?: unknown;
  __deliveryPreviousOutputValue__?: unknown;
  /** Address before this commit's first rekey. */
  __deliveryPreviousPath__?: string;
  /** Child identity collection before the first shape change. */
  __deliveryPreviousChildren__?: Nullable<readonly Self[]>;
  /** Packed active/visible/readOnly/disabled values before their first change. */
  __deliveryPreviousComputedBits__?: number;
  /** Effective schema identity before this commit's first schema change. */
  __deliveryPreviousSchema__?: EffectiveSchema;
  /** Interaction state before settlement clears or patches it. */
  __deliveryPreviousState__?: NodeStateFlags;
  /** Last compared watch values, present only on declared watch targets. */
  __deliveryWatchValues__?: readonly unknown[];
  /** Event bits and immutable payloads awaiting the next settlement wave. */
  __pendingDelivery__?: FieldNodeDelivery;
  /** Bits to advance once at this commit, independently of listeners. */
  __pendingRevisionMask__: number;
  /** State and command events awaiting their separate wave. */
  __pendingNonSettleDelivery__?: FieldNodeDelivery;
  /** Whether this reference has left the live shape. */
  isDetached: boolean;
  /** Retired by binding adoption; reads retain the preceding commit. */
  isDisposed: boolean;
  /** Monotone interaction lifetime, independent of event delivery. */
  __interactionEpoch__: number;
}
