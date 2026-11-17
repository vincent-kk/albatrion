import type { ReactNode } from 'react';

/** Form context that may relabel radio choices by value. */
export type RadioLabelsContext = {
  radioLabels?: {
    [label: string]: ReactNode;
  };
};
