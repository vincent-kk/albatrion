import { useContext } from 'react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  const { FormTypeRenderer, formatError, checkShowError } = useContext(
    FormTypeRendererContext,
  );
  return {
    FormTypeRenderer: FormTypeRenderer || FallbackManager.FormGroup,
    formatError: formatError || FallbackManager.formatError,
    checkShowError,
  };
};
