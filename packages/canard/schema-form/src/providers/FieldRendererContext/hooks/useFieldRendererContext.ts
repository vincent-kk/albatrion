import { useContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';

import { useExternalFormContext } from '../../ExternalFormContext';
import { FieldRendererContext } from '../components/FieldRendererContext';

export const useFieldRendererContext = () => {
  const context = useContext(FieldRendererContext);
  const external = useExternalFormContext();
  return {
    LabelRenderer:
      context.LabelRenderer ||
      external.LabelRenderer ||
      PluginManager.LabelRenderer,
    InputRenderer:
      context.InputRenderer ||
      external.InputRenderer ||
      PluginManager.InputRenderer,
    ErrorMessageRenderer:
      context.ErrorMessageRenderer ||
      external.ErrorMessageRenderer ||
      PluginManager.ErrorMessageRenderer,
    FieldRenderer: context.FieldRenderer || PluginManager.FieldRenderer,
    formatError: context.formatError || PluginManager.formatError,
    checkErrorVisibility: context.checkErrorVisibility,
    errorVisibility: context.errorVisibility,
  };
};
