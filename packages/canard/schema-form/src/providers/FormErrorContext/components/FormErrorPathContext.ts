import { createContext } from 'react';

/** Deferred Placeholder path, supplied only by DeferredFieldProxy. */
export const FormErrorPathContext = createContext<string | undefined>(
  undefined,
);
