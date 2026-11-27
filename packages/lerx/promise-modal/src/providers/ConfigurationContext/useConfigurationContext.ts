import { useContext } from 'react';

import { ConfigurationContext } from './ConfigurationContext';

/**
 * Reads configuration inside a modal frame, content, or footer component.
 * @param hookName - Public hook name used in the missing-context error.
 * @returns Mounted configuration; throws outside the modal tree.
 */
export const useConfigurationContext = (hookName = 'useModalOptions') => {
  const context = useContext(ConfigurationContext);
  if (!context)
    throw new Error(
      `[promise-modal] ${hookName} must be used inside a modal frame, content, or footer component; move it into the modal tree.`,
    );
  return context;
};

/** Returns normalized provider options from inside the modal tree; throws outside it. */
export const useConfigurationOptions = () => useConfigurationContext().options;

/** Returns the normalized CSS duration and milliseconds; throws outside the modal tree. */
export const useConfigurationDuration = () => {
  const { duration } = useConfigurationContext('useModalDuration').options;
  return { duration, milliseconds: parseFloat(duration) };
};

/** Returns backdrop CSS properties inside a modal frame, content, or footer; throws outside it. */
export const useConfigurationBackdrop = () =>
  useConfigurationContext('useModalBackdrop').options.backdrop;
