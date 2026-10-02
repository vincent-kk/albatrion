import { createContext } from 'react';

/** Nearest field path; undefined identifies the outer form boundary. */
export const FormErrorPathContext = createContext<string | undefined>(
  undefined,
);
