import { createContext } from 'react';

/** The renderer title address is consumed only by built-in controls that own a group title. */
export const FieldLabelContext = createContext<string | undefined>(undefined);
