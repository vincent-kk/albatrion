import type { ReactNode } from 'react';

/** Form context that may relabel select options by value. */
export type EnumLabelsContext = {
  enumLabels?: {
    [label: string]: ReactNode;
  };
};
