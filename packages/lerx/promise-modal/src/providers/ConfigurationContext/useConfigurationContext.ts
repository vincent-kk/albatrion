import { useContext } from 'react';

import { getMillisecondsFromDuration } from '@/promise-modal/helpers/getMillisecondsFromDuration';

import { ConfigurationContext } from './ConfigurationContext';

export const useConfigurationContext = () => useContext(ConfigurationContext);

export const useConfigurationOptions = () => {
  const context = useContext(ConfigurationContext);
  return context.options;
};

export const useConfigurationDuration = () => {
  const context = useConfigurationOptions();
  return {
    duration: context.duration,
    milliseconds: getMillisecondsFromDuration(context.duration),
  };
};

export const useConfigurationBackdrop = () => {
  const context = useConfigurationOptions();
  return context.backdrop;
};
