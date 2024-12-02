import { useContext } from 'react';

import { StaticManager } from '@lumy/schema-form/app/StaticManager';

import { FormTypeRendererContext } from './FormTypeRendererContext';

export const useFormTypeRendererContext = () => {
  const { FormTypeRenderer, formatError, checkShowError } = useContext(
    FormTypeRendererContext,
  );
  return {
    FormTypeRenderer: FormTypeRenderer || StaticManager.FormGroup,
    formatError: formatError || StaticManager.formatError,
    checkShowError,
  };
};
