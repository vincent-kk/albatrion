import type { Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

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
   */
  rootMargin?: string;
  /**
   * Backfill strategy after the initial mount (default: 'idle')
   *  - `'idle'`: progressively mount remaining fields during browser idle time
   *  - `'none'`: mount only on visibility or focus/select commands
   */
  backfill?: 'idle' | 'none';
  /**
   * Placeholder height in px before reveal, or a per-node estimator (default: 40)
   *  - Approximates scroll height; replaced by the real height after reveal
   */
  estimateHeight?: number | Fn<[node: SchemaNode], number>;
}

/**
 * VirtualizationOptions with all defaults applied.
 * @internal Consumed by VirtualizationManager and the render layer.
 */
export interface ResolvedVirtualizationOptions {
  threshold: number;
  eagerCount: number;
  rootMargin: string;
  backfill: 'idle' | 'none';
  estimateHeight: number | Fn<[node: SchemaNode], number>;
}
