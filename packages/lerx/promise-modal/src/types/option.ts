import type { Color, Duration } from '@aileron/declare';

export interface ModalOptions {
  /** Modal z-index */
  zIndex?: number;
  /** Modal transition time(ms, s) */
  duration?: Duration;
  /** Modal backdrop color */
  backdrop?: Color;
  /** Whether to destroy the modal manually */
  manualDestroy?: boolean;
  /** Whether to close the modal when the backdrop is clicked */
  closeOnBackdropClick?: boolean;
}
