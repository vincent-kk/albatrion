import { ReactElement } from 'react';

import { FormTypeRendererContext } from '@lumy/schema-form/providers';
import { FormTypeInputProps } from '@lumy/schema-form/types';

export type FormTypeRenderer = FormTypeRendererContext['FormTypeRenderer'];

export type ChildFormTypeRenderer = ElementOf<FormTypeInputProps['childNodes']>;

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
