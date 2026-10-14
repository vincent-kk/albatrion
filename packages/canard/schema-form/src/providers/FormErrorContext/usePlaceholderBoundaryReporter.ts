import { useContext } from 'react';

import { FormErrorPathContext } from './FormErrorPathContext';
import { useBoundaryReporter } from './useBoundaryReporter';

/** Read the deferred Placeholder's path and report through the current form service. */
export const usePlaceholderBoundaryReporter = () =>
  useBoundaryReporter(useContext(FormErrorPathContext));
