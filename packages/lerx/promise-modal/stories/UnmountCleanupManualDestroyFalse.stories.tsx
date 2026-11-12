// Loaded by Storybook; exports demonstrate automatic destruction after caller cleanup.
import { UnmountExample } from './components/UnmountExample';

export default { title: 'PromiseModal/UnmountCleanupManualDestroyFalse' };

/** Non-manual frames hide immediately but remain alive until the duration expires. */
export const BasicUnmountCleanup = () => (
  <UnmountExample manualDestroy={false} />
);
/** Independent callers can be removed without cancelling one another's requests. */
export const MultipleComponentsCleanup = () => (
  <UnmountExample manualDestroy={false} multiple />
);
/** Caller cleanup also works when a timer removes the caller. */
export const AutoUnmountCleanup = () => (
  <UnmountExample manualDestroy={false} automatic />
);
