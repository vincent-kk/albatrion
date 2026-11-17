import type { CSSProperties, ReactNode } from 'react';

export interface FormLabelProps {
  /** Explicit label content; undefined uses the schema name and null stays empty. */
  children?: ReactNode;
  path?: string;
  style?: CSSProperties;
  className?: string;
}
