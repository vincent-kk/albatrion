import type { BlueprintNode } from '../../../blueprint';
import type { ControlLayer } from './getControlLayers';

/** Static group with its original order, independent of a live host. */
export interface PreparedControlLayer
  extends Omit<ControlLayer<never>, 'host'> {
  /** Stable position among the parent's fragment and fields groups. */
  readonly order: number;
  /** Child declaration IDs that establish fragment ownership. */
  readonly ownerIds?: readonly number[];
}

/** General groups and the sparse subset that authors an exit policy. */
export interface PreparedControlGroups {
  /** Authored groups in their original order. */
  readonly all: readonly PreparedControlLayer[];
  /** Only groups declaring unsetOnInactive. */
  readonly exit: readonly PreparedControlLayer[];
}

/** Pure template metadata; dynamic selections and expression values stay outside. */
export interface PreparedControlIndex {
  /** Any own, fragment or fields group declares an exit policy. */
  readonly hasExitControls: boolean;
  /** Fallback selection before the first commit. */
  readonly ids: readonly number[];
  /** Controls declared directly on this template. */
  readonly node: PreparedControlGroups;
  /** Fragment groups addressed by their exact owner path. */
  readonly fragments: ReadonlyMap<string, readonly PreparedControlLayer[]>;
  /** Fields groups addressed by their decoded child name. */
  readonly fields: ReadonlyMap<string, readonly PreparedControlLayer[]>;
  /** Child declaration IDs contributing to each fragment owner. */
  owners?: ReadonlyMap<string, readonly number[]>;
  /** Lazily combined sparse parent groups, keyed only by immutable target facts. */
  targets?: WeakMap<
    BlueprintNode,
    Map<string | undefined, PreparedControlGroups>
  >;
}
