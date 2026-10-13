import { useMemo } from 'react';

import { isReactComponent } from '@winglet/react-utils/filter';

import { PluginManager } from '@/schema-form/app/plugin';
import type { SchemaNode } from '@/schema-form/core';
import { withFieldInputErrorBoundary } from '@/schema-form/helpers/fieldInputDefinition';
import {
  useExternalFormContext,
  useFieldInputsContext,
} from '@/schema-form/providers';
import type { Hint, JSONSchema } from '@/schema-form/types';

/** Select an input from the effective schema and ordered definition sources. */
export const useFieldInput = (node: SchemaNode, disabled: boolean) => {
  const { fromFieldInputMap, fromFieldInputDefinitions } =
    useFieldInputsContext();
  const { fromExternalFieldInputDefinitions } = useExternalFormContext();
  const schema = node.jsonSchema as JSONSchema;
  const path = node.path;
  const inline = schema.presentation?.FieldInput;
  const Inline = useMemo(
    () =>
      isReactComponent(inline) ? withFieldInputErrorBoundary(inline) : null,
    [inline],
  );
  return useMemo(() => {
    if (disabled || inline === null) return null;
    if (Inline) return Inline;
    const hint: Hint = {
      type: node.type,
      schemaType: node.schemaType,
      typeMismatch: node.typeMismatch,
      path,
      required: node.required,
      nullable: node.nullable,
      jsonSchema: schema,
      format: typeof schema.format === 'string' ? schema.format : undefined,
      inputType:
        typeof schema.presentation?.inputType === 'string'
          ? schema.presentation.inputType
          : undefined,
    };
    for (const definitions of [
      fromFieldInputMap,
      fromFieldInputDefinitions,
      fromExternalFieldInputDefinitions,
      PluginManager.fieldInputDefinitions,
    ])
      for (const { test, Component } of definitions ?? [])
        if (test(hint)) return Component;
    return null;
  }, [
    node,
    schema,
    path,
    disabled,
    inline,
    Inline,
    fromFieldInputMap,
    fromFieldInputDefinitions,
    fromExternalFieldInputDefinitions,
  ]);
};
