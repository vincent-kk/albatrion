import { useContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  const { FormTypeRenderer, formatError, checkShowError } = useContext(
    FormTypeRendererContext,
  );
  return {
    FormTypeRenderer: FormTypeRenderer || PluginManager.FormGroup,
    formatError: formatError || PluginManager.formatError,
    checkShowError,
  };
};
