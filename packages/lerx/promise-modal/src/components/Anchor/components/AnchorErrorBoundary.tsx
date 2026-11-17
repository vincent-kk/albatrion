import { Component, type PropsWithChildren } from 'react';

import type { Fn } from '@aileron/declare';

/** Registration identity prevents immediate retries of a failed anchor render. */
interface Props {
  resetKey: number;
  onError: Fn<[error: unknown]>;
}
/** Stores the registration that last reset this boundary. */
interface State {
  failed: boolean;
  resetKey: number;
}

/** Last-resort boundary stays empty until the next registration, avoiding retry loops. */
export class AnchorErrorBoundary extends Component<
  PropsWithChildren<Props>,
  State
> {
  state: State = { failed: false, resetKey: this.props.resetKey };
  /** Resets only when a new modal registers, never when failed nodes are removed. */
  static getDerivedStateFromProps(props: Props, state: State): State | null {
    return props.resetKey !== state.resetKey
      ? { failed: false, resetKey: props.resetKey }
      : null;
  }
  /** Contains a failed render until registration supplies a fresh recovery boundary. */
  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }
  /** Delegates node rejection and destruction to the context-owned operation. */
  componentDidCatch(error: unknown): void {
    this.props.onError(error);
  }
  /** Returns no fallback content while failed so later registrations can recover. */
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
