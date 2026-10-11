import { useContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';

import { useExternalFormContext } from '../ExternalFormContext';
import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  const context = useContext(FormTypeRendererContext);
  const external = useExternalFormContext();
  return {
    FormTypeLabelRenderer:
      context.FormTypeLabelRenderer ||
      external.FormTypeLabelRenderer ||
      PluginManager.FormTypeLabelRenderer,
    FormTypeInputRenderer:
      context.FormTypeInputRenderer ||
      external.FormTypeInputRenderer ||
      PluginManager.FormTypeInputRenderer,
    FormTypeErrorRenderer:
      context.FormTypeErrorRenderer ||
      external.FormTypeErrorRenderer ||
      PluginManager.FormTypeErrorRenderer,
    FormTypeGroupRenderer:
      context.FormTypeGroupRenderer || PluginManager.FormTypeGroupRenderer,
    formatError: context.formatError || PluginManager.formatError,
    checkShowError: context.checkShowError,
  };
};
