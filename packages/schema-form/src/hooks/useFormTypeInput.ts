import { memo, useContext, useMemo } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import { FormTypeInputsContext } from '@lumy/schema-form/providers';
import type { Hint } from '@lumy/schema-form/types';

export function useFormTypeInput(node: SchemaNode) {
  const formTypeInputDefinitions = useContext(FormTypeInputsContext);
  const FormTypeInput = useMemo(() => {
    const hint = getHint(node);
    for (const { test, Component } of formTypeInputDefinitions) {
      if (test?.(hint)) {
        return memo(Component);
      }
    }
    return null;
  }, [node, formTypeInputDefinitions]);
  return FormTypeInput;
}

const getHint = (node: SchemaNode): Hint => ({
  type: node.jsonSchema.type,
  path: node.path,
  jsonSchema: node.jsonSchema,
  format: node.jsonSchema.format,
  formType: node.jsonSchema.formType,
});
