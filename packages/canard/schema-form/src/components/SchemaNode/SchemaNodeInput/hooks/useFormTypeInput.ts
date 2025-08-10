import { memo, useMemo } from 'react';

import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';

import { PluginManager } from '@/schema-form/app/plugin';
import type { SchemaNode } from '@/schema-form/core';
import {
  useExternalFormContext,
  useFormTypeInputsContext,
} from '@/schema-form/providers';
import type { Hint } from '@/schema-form/types';

/**
 * Returns form type input for the schema node.
 *   - Returns form type input defined in InlineFormType.
 *   - Returns form type input first defined in FormTypeInputMap.
 *   - Returns form type input defined in FormTypeInputDefinitions.
 *   - Returns form type input defined in fallback FormTypeInputDefinitions.
 * @param node - SchemaNode
 * @param disabled - Whether searching form type input is disabled
 * @returns FormTypeInput
 */
export const useFormTypeInput = (node: SchemaNode, disabled: boolean) => {
  const { fromFormTypeInputMap, fromFormTypeInputDefinitions } =
    useFormTypeInputsContext();
  const { fromExternalFormTypeInputDefinitions } = useExternalFormContext();

  const FormTypeInput = useMemo(() => {
    if (disabled) return null;
    // NOTE: If formType is a React Component, return that Component.
    const InlineFormType = node.jsonSchema?.FormType;
    if (InlineFormType && isReactComponent(InlineFormType))
      if (isMemoComponent(InlineFormType))
        return withErrorBoundary(InlineFormType);
      else return memo(withErrorBoundary(InlineFormType));

    const hint = getHint(node);

    // NOTE: FormTypeInputMap has higher priority than FormTypeInputDefinitions
    for (const { test, Component } of fromFormTypeInputMap)
      if (test(hint)) return memo(Component);

    // NOTE: FormTypeInputDefinitions has lower priority than FormTypeInputMap
    for (const { test, Component } of fromFormTypeInputDefinitions)
      if (test(hint)) return memo(Component);

    // NOTE: ExternalFormTypeInputDefinitions has lowest priority, it run only if it exists
    if (fromExternalFormTypeInputDefinitions)
      for (const { test, Component } of fromExternalFormTypeInputDefinitions)
        if (test(hint)) return memo(Component);

    // NOTE: fallback FormTypeInputDefinitions has lowest priority
    const fallbackDefinitions = PluginManager.formTypeInputDefinitions;
    for (const { test, Component } of fallbackDefinitions)
      if (test(hint)) return memo(Component);

    return null;
  }, [
    node,
    disabled,
    fromFormTypeInputMap,
    fromFormTypeInputDefinitions,
    fromExternalFormTypeInputDefinitions,
  ]);
  return FormTypeInput;
};

const getHint = (node: SchemaNode): Hint => ({
  type: node.jsonSchema.type,
  path: node.path,
  jsonSchema: node.jsonSchema,
  format: node.jsonSchema.format,
  formType: node.jsonSchema.formType,
});
