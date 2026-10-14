import { type PropsWithChildren, useInsertionEffect, useState } from 'react';

import type { FormErrorRecord } from '@/schema-form/errors';

import { FormErrorContext } from './FormErrorContext';
import { createFormErrorService } from './utils/createFormErrorService';

/** Retain one reporter across fallback and StrictMode effect replay. */
export const FormErrorContextProvider = ({
  onError,
  children,
}: PropsWithChildren<{
  onError?: (record: FormErrorRecord) => void;
}>) => {
  const [reporter] = useState(() => {
    const service = createFormErrorService();
    service.onError = onError;
    return service;
  });
  useInsertionEffect(() => {
    reporter.onError = onError;
  }, [reporter, onError]);
  return (
    <FormErrorContext.Provider value={reporter}>
      {children}
    </FormErrorContext.Provider>
  );
};
