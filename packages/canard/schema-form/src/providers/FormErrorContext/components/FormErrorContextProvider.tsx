import { type PropsWithChildren, useInsertionEffect, useState } from 'react';

import type { Fn } from '@aileron/declare';

import type { FormErrorRecord } from '@/schema-form/errors';

import { createFormErrorService } from '../utils/createFormErrorService';
import { FormErrorContext } from './FormErrorContext';

/** Retain one reporter across fallback and StrictMode effect replay. */
export const FormErrorContextProvider = ({
  onError,
  children,
}: PropsWithChildren<{
  onError?: Fn<[record: FormErrorRecord]>;
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
