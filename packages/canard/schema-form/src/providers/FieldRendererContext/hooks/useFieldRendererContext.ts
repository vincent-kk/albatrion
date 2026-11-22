import { useContext } from 'react';

import { useExternalFormContext } from '../../ExternalFormContext';
import { FieldRendererContext } from '../components/FieldRendererContext';

export const useFieldRendererContext = () => {
  const context = useContext(FieldRendererContext);
  const external = useExternalFormContext();
  return {
    LabelRenderer:
      context.LabelRenderer ||
      external.LabelRenderer ||
      external.pluginManager.LabelRenderer,
    InputRenderer:
      context.InputRenderer ||
      external.InputRenderer ||
      external.pluginManager.InputRenderer,
    ErrorMessageRenderer:
      context.ErrorMessageRenderer ||
      external.ErrorMessageRenderer ||
      external.pluginManager.ErrorMessageRenderer,
    FieldRenderer:
      context.FieldRenderer || external.pluginManager.FieldRenderer,
    formatError: context.formatError || external.pluginManager.formatError,
    checkErrorVisibility: context.checkErrorVisibility,
    errorVisibility: context.errorVisibility,
  };
};
