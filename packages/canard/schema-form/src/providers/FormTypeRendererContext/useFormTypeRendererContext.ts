import { useContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  const context = useContext(FormTypeRendererContext);
  return {
    FormTypeRenderer: context.FormTypeRenderer || PluginManager.FormGroup,
    formatError: context.formatError || PluginManager.formatError,
    checkShowError: context.checkShowError,
  };
};
