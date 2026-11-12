// Loaded by Storybook; exports select caller cleanup scenarios with exit animation.
import { UnmountExample } from './components/UnmountExample';

export default { title: 'PromiseModal/UnmountCleanupUsecase' };

/** Unmounting the caller cancels its pending requests and animates their exit. */
export const BasicUnmountCleanup = () => <UnmountExample manualDestroy />;
/** Each caller owns only the requests it opens. */
export const MultipleComponentsCleanup = () => (
  <UnmountExample manualDestroy multiple />
);
/** A timer unmounts the caller even while its modal is open. */
export const AutoUnmountCleanup = () => (
  <UnmountExample manualDestroy automatic />
);
