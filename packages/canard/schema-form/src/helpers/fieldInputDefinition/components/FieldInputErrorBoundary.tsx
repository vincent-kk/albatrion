import type { ComponentProps } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import type { FieldInputBindingProps } from '../type';

/** Existing error boundary props plus the input lifetime retired before mutation. */
type Props = ComponentProps<typeof ErrorBoundary> &
  Pick<FieldInputBindingProps, 'inputSelection'>;

/** Reuses the error boundary fiber to retire keyed input cleanup before DOM mutation. */
export class FieldInputErrorBoundary extends ErrorBoundary {
  /** Current selection is private to the adapter and never reaches the raw input. */
  declare readonly props: Props;

  /**
   * Accept the selection alongside the inherited reporter and fallback contract.
   * @param props - Error handling props and the lifetime for the raw input commit.
   */
  constructor(props: Props) {
    super(props);
  }

  /**
   * Retire a replaced selection before descendant layout cleanup can write through it.
   * @param previous - Props from the preceding committed boundary render.
   * @returns Null because retirement produces no data for the post-commit lifecycle.
   */
  getSnapshotBeforeUpdate(previous: Props): null {
    if (previous.inputSelection !== this.props.inputSelection)
      previous.inputSelection.active = false;
    return null;
  }

  /** Pairs the snapshot lifecycle to satisfy React's development-time check. */
  componentDidUpdate(): void {}
}
