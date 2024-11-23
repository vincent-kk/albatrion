import { ReactElement } from 'react';

import { SchemaNodeRendererContext } from '@lumy/schema-form/providers';
import { FormTypeInputProps } from '@lumy/schema-form/types';

export type SchemaNodeRenderer =
  SchemaNodeRendererContext['SchemaNodeRenderer'];

export type ChildSchemaNodeRenderer = ElementOf<
  FormTypeInputProps['childNodes']
>;

export type FormReactNode =
  | string
  | ReactElement
  | { name: string; grid?: number; [alt: string]: any }
  | { element: ReactElement; grid?: number; [alt: string]: any };

export type GridForm = Array<FormReactNode | FormReactNode[]>;
