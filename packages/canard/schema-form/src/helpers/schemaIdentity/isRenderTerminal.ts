import { isReactComponent } from '@winglet/react-utils/filter';

import type { SchemaNode } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/** Infer terminal rendering only from an authored inline input component. */
export const isRenderTerminal = (
  schema: SchemaNode['jsonSchema'],
): boolean | undefined =>
  schema &&
  typeof schema === 'object' &&
  isReactComponent((schema as JSONSchema).presentation?.FormTypeInput)
    ? true
    : undefined;
