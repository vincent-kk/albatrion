import { useCallback, useContext } from 'react';

import { FormErrorPathContext } from './FormErrorPathContext';
import { useFormErrorContext } from './useFormErrorContext';

/** Return a stable boundary callback that reports only React's componentStack. */
export const useBoundaryReporter = () => {
  const reporter = useFormErrorContext();
  const path = useContext(FormErrorPathContext);
  return useCallback(
    (error: unknown, info: { componentStack?: string }) => {
      if (path === undefined) reporter?.pendingLoad?.();
      reporter?.capture(error, info.componentStack ?? '', 'sink', path);
    },
    [reporter, path],
  );
};
