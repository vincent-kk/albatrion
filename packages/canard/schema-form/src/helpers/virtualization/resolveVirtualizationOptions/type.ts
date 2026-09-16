import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

/** IntersectionObserver rootMargin component — the spec allows only px or % */
type RootMarginUnit = `${number}px` | `${number}%`;

/**
 * CSS-margin shorthand (1-4 components) restricted to the units
 * IntersectionObserver.rootMargin accepts; anything else (em/rem/vh/calc)
 * throws a SyntaxError at observer construction.
 */
export type VirtualizationRootMargin =
  | RootMarginUnit
  | `${RootMarginUnit} ${RootMarginUnit}`
  | `${RootMarginUnit} ${RootMarginUnit} ${RootMarginUnit}`
  | `${RootMarginUnit} ${RootMarginUnit} ${RootMarginUnit} ${RootMarginUnit}`;

/**
 * Backfill strategy applied after the initial eager mount.
 * Mutually exclusive single choice (never combined) — string-literal enum, not a
 * `BIT_FLAG` bitmask, since bitmask values here would only invite an unusable
 * `None | Idle` combination.
 */
export enum VirtualizationBackfill {
  /** Do not backfill — reveal only on visibility or focus/select commands */
  None = 'none',
  /** Progressively mount the remaining fields during browser idle time */
  Idle = 'idle',
}

/** Props handed to a custom placeholder component while a field is deferred */
export interface VirtualizationPlaceholderProps {
  /** Node whose subtree is not mounted yet */
  node: SchemaNode;
  /** Reserved height (px) resolved from `estimateHeight` — fill it (e.g. `height: '100%'`) */
  height: number;
}

/**
 * Render-level virtualization (deferred mount) options for large forms.
 * @remarks Off-screen fields render as lightweight placeholders and are
 *          replaced with the real components when they approach the viewport,
 *          on browser idle time (backfill), or on focus/select commands.
 *          The node tree is always fully built regardless of these options.
 */
export interface VirtualizationOptions {
  /**
   * Gate children only when a branch has at least this many rendered children (default: 30)
   *  - Branches below the threshold keep the exact non-virtualized render path
   */
  threshold?: number;
  /**
   * Number of leading children per gated branch that mount eagerly (default: 20)
   *  - Prevents a blank first frame while IntersectionObserver callbacks are pending
   */
  eagerCount?: number;
  /**
   * IntersectionObserver rootMargin — pre-mount distance around the viewport (default: '100%')
   *  - '100%' mounts fields within one extra viewport above and below
   *  - Percentages resolve against the root (viewport) size; only px/% are valid
   */
  rootMargin?: VirtualizationRootMargin;
  /**
   * Backfill strategy after the initial mount (default: `VirtualizationBackfill.Idle`)
   *  - `Idle`: progressively mount remaining fields during browser idle time
   *  - `None`: mount only on visibility or focus/select commands
   */
  backfill?: VirtualizationBackfill;
  /**
   * Placeholder height in px before reveal, or a per-node estimator (default: 40)
   *  - Approximates scroll height; replaced by the real height after reveal
   */
  estimateHeight?: number | Fn<[node: SchemaNode], number>;
  /**
   * Custom component rendered inside deferred placeholders (default: none — an empty box)
   *  - Purely visual (skeletons, shimmer); space reservation stays with `estimateHeight`
   *  - Mounted once per deferred field — keep it light, or it erodes the mount savings
   *  - Rendered under `aria-hidden`; it is decoration, not content
   */
  Placeholder?: ComponentType<VirtualizationPlaceholderProps>;
}

/**
 * VirtualizationOptions with all defaults applied.
 * @remarks Consumed by VirtualizationManager and the render layer. Package
 * internal, but must survive `stripInternal`: `VirtualizationManager`'s
 * constructor signature references it, so stripping the declaration leaves the
 * `index.ts` re-export dangling. Never name the strip tag in this comment —
 * TypeScript matches it as a plain substring anywhere in the comment text.
 */
export interface ResolvedVirtualizationOptions {
  threshold: number;
  eagerCount: number;
  rootMargin: VirtualizationRootMargin;
  backfill: VirtualizationBackfill;
  estimateHeight: number | Fn<[node: SchemaNode], number>;
  Placeholder: ComponentType<VirtualizationPlaceholderProps> | null;
}
