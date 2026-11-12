import { useMemo } from 'react';

import { isReactComponent } from '@winglet/react-utils/filter';

import type { Nullable } from '@aileron/declare';

import { PluginManager } from '@/schema-form/app/plugin';
import type { FieldNode } from '@/schema-form/core';
import {
  type NormalizedFieldInputDefinition,
  withFieldInputErrorBoundary,
} from '@/schema-form/helpers/fieldInputDefinition';
import { useFieldInputsContext } from '@/schema-form/providers';
import { useExternalInputContext } from '@/schema-form/providers/ExternalFormContext';
import type { FieldInputHint, JSONSchema } from '@/schema-form/types';

/**
 * Select an input from the effective schema and ordered definition sources.
 * @param node - Field whose effective schema and hint drive the selection
 * @param disabled - True when a preferred input replaces this selection
 * @returns The resolved component with its definition's `controlled` declaration, or null
 */
export const useFieldInput = (
  node: FieldNode,
  disabled: boolean,
): Nullable<
  Pick<NormalizedFieldInputDefinition, 'Component' | 'controlled'>
> => {
  const { fromFieldInputMap, fromFieldInputDefinitions } =
    useFieldInputsContext();
  const { fromExternalFieldInputDefinitions } = useExternalInputContext();
  const schema = node.jsonSchema as JSONSchema;
  const path = node.path;
  const inline = schema.presentation?.FieldInput;
  const Inline = useMemo(
    () =>
      isReactComponent(inline)
        ? { Component: withFieldInputErrorBoundary(inline) }
        : null,
    [inline],
  );
  return useMemo(() => {
    if (disabled || inline === null) return null;
    if (Inline) return Inline;
    const hint: FieldInputHint = {
      type: node.type,
      schemaType: node.schemaType,
      misfit: node.isMisfit,
      path,
      required: node.isRequired,
      nullable: node.nullable,
      jsonSchema: schema,
      format: typeof schema.format === 'string' ? schema.format : undefined,
      inputType: schema.presentation?.inputType,
    };
    for (const definitions of [
      fromFieldInputMap,
      fromFieldInputDefinitions,
      fromExternalFieldInputDefinitions,
      PluginManager.fieldInputDefinitions,
    ])
      for (const definition of definitions ?? [])
        if (definition.test(hint)) return definition;
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
