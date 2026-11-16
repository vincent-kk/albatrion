import type { ComponentProps } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import type { FieldInputBindingProps } from '../type';

/** Existing error boundary props plus the input lifetime retired before mutation. */
type Props = ComponentProps<typeof ErrorBoundary> &
  Pick<FieldInputBindingProps, 'inputSelection'>;

/** Reuses the error boundary fiber to retire keyed input cleanup before DOM mutation. */
export class FieldInputErrorBoundary extends ErrorBoundary {
  /** Current selection is private to the adapter and never reaches the raw input. */
  declare props: Props;

  /** Accept the selection alongside the inherited reporter and fallback contract. */
  constructor(props: Props) {
    super(props);
  }

  /** Invalidate the previous committed selection before descendant layout cleanup. */
  getSnapshotBeforeUpdate(previous: Props): null {
    if (previous.inputSelection !== this.props.inputSelection)
      previous.inputSelection.active = false;
    return null;
  }

  /** React requires this paired lifecycle when a boundary takes a pre-mutation snapshot. */
  componentDidUpdate(): void {}
}
