import { useContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';

import { useExternalFormContext } from '../../ExternalFormContext';
import { FieldRendererContext } from '../components/FieldRendererContext';

export const useFieldRendererContext = () => {
  const context = useContext(FieldRendererContext);
  const external = useExternalFormContext();
  return {
    FormLabelRenderer:
      context.FormLabelRenderer ||
      external.FormLabelRenderer ||
      PluginManager.FormLabelRenderer,
    FormInputRenderer:
      context.FormInputRenderer ||
      external.FormInputRenderer ||
      PluginManager.FormInputRenderer,
    FormErrorRenderer:
      context.FormErrorRenderer ||
      external.FormErrorRenderer ||
      PluginManager.FormErrorRenderer,
    FieldRenderer: context.FieldRenderer || PluginManager.FieldRenderer,
    formatError: context.formatError || PluginManager.formatError,
    checkShowError: context.checkShowError,
    resolveShowError: context.resolveShowError,
  };
};
