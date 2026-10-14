import { useCallback } from 'react';

import { useFormErrorContext } from './useFormErrorContext';

/** Return a stable callback for the explicit field path, or the root when omitted. */
export const useBoundaryReporter = (path?: string) => {
  const reporter = useFormErrorContext();
  return useCallback(
    (error: unknown, info: { componentStack?: string }) => {
      if (path === undefined) reporter?.pendingLoad?.();
      reporter?.capture(error, info.componentStack ?? '', 'sink', path);
    },
    [reporter, path],
  );
};
