import { createContext } from 'react';

/** Deferred Placeholder path, supplied only by DeferrableNodeProxy. */
export const FormErrorPathContext = createContext<string | undefined>(
  undefined,
);
