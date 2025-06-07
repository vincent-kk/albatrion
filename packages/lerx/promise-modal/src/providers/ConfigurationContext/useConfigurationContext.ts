import { useContext } from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';

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
    milliseconds: convertMsFromDuration(context.duration),
  };
};

export const useConfigurationBackdrop = () => {
  const context = useConfigurationOptions();
  return context.backdrop;
};
