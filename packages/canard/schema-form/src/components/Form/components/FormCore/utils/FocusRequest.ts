import type { Fn } from '@aileron/declare';

/** Cancellation owner installed before reveal can synchronously commit another request. */
export class FocusRequest {
  /** Cancellation is permanent even when the old load predicate becomes true again. */
  private cancelled = false;
  /** Request-local listener and reservation disposals, in registration order. */
  private readonly cleanups: Fn[] = [];
  /** Load identity ignores the temporary unmounted state during effect replay. */
  private readonly isCurrentLoad: () => boolean;

  /** @param isCurrentLoad - Checks the issued load and root, never effect-mounted state. */
  constructor(isCurrentLoad: () => boolean) {
    this.isCurrentLoad = isCurrentLoad;
  }
  /** True only while uncancelled and still bound to the issued load. */
  get live(): boolean {
    return !this.cancelled && this.isCurrentLoad();
  }
  /** Register a nonthrowing disposal, or execute immediately after cancellation. */
  onCancel(cleanup: Fn): void {
    if (this.cancelled) cleanup();
    else this.cleanups.push(cleanup);
  }
  /** Cancel once and release every owned listener/reservation in registration order. */
  cancel(): void {
    if (this.cancelled) return;
    this.cancelled = true;
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups.length = 0;
  }
}
