import type { CSSProperties } from 'react';

import type { Color } from '@aileron/declare';

export interface ModalOptions {
  /** Modal z-index */
  zIndex?: number;
  /** Nonnegative milliseconds or a decimal ms/s duration string. */
  duration?: number | `${number}ms` | `${number}s`;
  /** Modal backdrop color */
  backdrop?: Color | CSSProperties;
  /** Whether to destroy the modal manually */
  manualDestroy?: boolean;
  /** Whether to close the modal when the backdrop is clicked */
  closeOnBackdropClick?: boolean;
  /** Escape override; otherwise inherits the same-level backdrop click setting. */
  closeOnEscape?: boolean;
  /** Traps Tab only when the top visible pending modal is dimmed; defaults to true. */
  trapFocus?: boolean;
  /** Locks body scrolling while a pending dimmed modal is visible; defaults to true. */
  lockScroll?: boolean;
}
