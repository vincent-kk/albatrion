import type { ReactElement } from 'react';

export type FormReactNode =
  | string
  | ReactElement
  | { name: string; grid?: number; [alt: string]: any }
  | { element: ReactElement; grid?: number; [alt: string]: any };

export type GridForm = Array<FormReactNode | FormReactNode[]>;

export const isListFrom = (
  gridFrom: Array<FormReactNode> | Array<FormReactNode | FormReactNode[]>,
): gridFrom is Array<FormReactNode> =>
  gridFrom.every((row) => !Array.isArray(row));
