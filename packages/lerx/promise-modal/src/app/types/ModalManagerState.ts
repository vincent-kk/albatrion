import type { styleManagerFactory } from '@winglet/style-utils/style-manager';

import type { Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import type { Modal } from '@/promise-modal/types';

/** Queued requests retain both Promise channels while no portal is attached. */
export interface PrerenderEntry {
  /** Request data includes its original settlement callbacks. */
  modal: Modal;
  /** Optional continuation runs after a queued request is dispatched. */
  dispatch?: Fn;
}

/** A bootstrap's identity and notification channel, independent of React trees. */
export interface BootstrapOwner {
  /** Null detaches an existing owner without discarding its portal. */
  root: HTMLElement | null;
  /** Ownership changes notify the corresponding bootstrap only. */
  notify: Fn<[HTMLElement | null]>;
}

/** All mutable runtime resources share one shape-versioned registry object. */
export interface ModalManagerState {
  /** Increment whenever another copy cannot use this state shape. */
  version: number;
  /** Rendered wrappers provide focus boundaries without imposing frame semantics. */
  frames: Map<number, HTMLElement>;
  /** Registration captures the opener until the request first settles. */
  focusTargets: Map<number, Element | null>;
  /** Visible intervals receive initial focus only once. */
  focused: Set<number>;
  /** Only attributes introduced by this manager are removed on release. */
  inertElements: Element[];
  /** The root where the current inert snapshot starts. */
  inertRoot: HTMLElement | null;
  /** Original inline properties, including priorities, survive scroll locking. */
  scrollStyle?: {
    overflow: string;
    overflowPriority: string;
    padding: string;
    paddingPriority: string;
  };
  /** The exact installed callback is shared by Escape and Tab handling. */
  keydown?: (event: KeyboardEvent) => void;
  /** The portal container belongs to the active bootstrap. */
  anchor: HTMLElement | null;
  /** A stable style scope survives provider handoffs and duplicate loads. */
  scope: string;
  /** CSS class identity is computed without browser globals. */
  hash: string;
  /** The scope manager exists only between browser attach and detach. */
  styleManager?: ReturnType<typeof styleManagerFactory>;
  /** Canonical CSS definitions survive detach for later initialization. */
  styleSheetDefinition: Map<string, string>;
  /** Alive nodes remain independent of the provider render tree. */
  nodes: Map<number, ModalNode>;
  /** Each registered node has one store-owned subscription. */
  nodeCleanups: Map<number, Fn>;
  /** Membership snapshot changes only on registration or removal. */
  ids: readonly number[];
  /** External-store listeners observe node publications. */
  listeners: Set<Fn>;
  /** Ids remain unique across provider instances until test reset. */
  id: number;
  /** Stack positions increase until the store becomes empty. */
  order: number;
  /** Boundary recovery advances only when a new node registers. */
  registrationVersion: number;
  /** Initialization invalidates a previously scheduled detach cancellation. */
  generation: number;
  /** One identity at a time may render the portal. */
  owner: object | null;
  /** Development ownership warnings are limited to once per bootstrap. */
  warned: WeakSet<object>;
  /** Insertion order determines the next waiting owner. */
  bootstraps: Map<object, BootstrapOwner>;
  /** Pre-mount requests retain their settlement channels. */
  prerenderList: PrerenderEntry[];
  /** A shared queue-mode function permits guarded handler cleanup across copies. */
  defaultOpenHandler: Fn<[Modal], ModalNode | undefined>;
  /** The active layout effect owns this handler until its guarded cleanup. */
  openHandler: Fn<[Modal], ModalNode | undefined>;
}
