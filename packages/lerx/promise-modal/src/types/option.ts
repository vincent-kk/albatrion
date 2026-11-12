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
}
