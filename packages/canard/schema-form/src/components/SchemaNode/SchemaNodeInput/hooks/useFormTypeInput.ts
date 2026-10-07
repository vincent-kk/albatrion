import { useMemo } from 'react';

import { isReactComponent } from '@winglet/react-utils/filter';

import { PluginManager } from '@/schema-form/app/plugin';
import type { SchemaNode } from '@/schema-form/core';
import { withFormTypeInputErrorBoundary } from '@/schema-form/helpers/formTypeInputDefinition';
import {
  useExternalFormContext,
  useFormTypeInputsContext,
} from '@/schema-form/providers';
import type { Hint, JSONSchema } from '@/schema-form/types';

/** Select an input from the effective schema and ordered definition sources. */
export const useFormTypeInput = (node: SchemaNode, disabled: boolean) => {
  const { fromFormTypeInputMap, fromFormTypeInputDefinitions } =
    useFormTypeInputsContext();
  const { fromExternalFormTypeInputDefinitions } = useExternalFormContext();
  const schema = node.jsonSchema as JSONSchema;
  const path = node.path;
  const inline = schema.presentation?.FormTypeInput;
  const Inline = useMemo(
    () =>
      isReactComponent(inline)
        ? withFormTypeInputErrorBoundary(inline)
        : null,
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
      formType:
        typeof schema.presentation?.formType === 'string'
          ? schema.presentation.formType
          : undefined,
    };
    for (const definitions of [
      fromFormTypeInputMap,
      fromFormTypeInputDefinitions,
      fromExternalFormTypeInputDefinitions,
      PluginManager.formTypeInputDefinitions,
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
    fromFormTypeInputMap,
    fromFormTypeInputDefinitions,
    fromExternalFormTypeInputDefinitions,
  ]);
};
