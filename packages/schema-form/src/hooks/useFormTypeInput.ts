import { memo, useContext, useMemo } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import { FormTypeInputsContext } from '@lumy/schema-form/providers';
import type { Hint } from '@lumy/schema-form/types';

export function useFormTypeInput(node: SchemaNode) {
  const { fromFormTypeInputMap, fromFormTypeInputDefinitions } = useContext(
    FormTypeInputsContext,
  );
  const FormTypeInput = useMemo(() => {
    const hint = getHint(node);
    // NOTE: FormTypeInputMap has higher priority than FormTypeInputDefinitions
    for (const { test, Component } of fromFormTypeInputMap) {
      if (test?.(hint)) {
        return memo(Component);
      }
    }
    // NOTE: FormTypeInputDefinitions has lower priority than FormTypeInputMap
    for (const { test, Component } of fromFormTypeInputDefinitions) {
      if (test?.(hint)) {
        return memo(Component);
      }
    }
    return null;
  }, [node, fromFormTypeInputMap, fromFormTypeInputDefinitions]);
  return FormTypeInput;
}

const getHint = (node: SchemaNode): Hint => ({
  type: node.jsonSchema.type,
  path: node.path,
  jsonSchema: node.jsonSchema,
  format: node.jsonSchema.format,
  formType: node.jsonSchema.formType,
});
