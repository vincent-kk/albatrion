import { memo, useMemo } from 'react';

import { isFunctionComponent, isMemoComponent } from '@lumy-pack/common-react';

import { withErrorBoundary } from '@lumy/schema-form/components/utils/withErrorBoundary';
import type { SchemaNode } from '@lumy/schema-form/core';
import { fromFallbackFormTypeInputDefinitions } from '@lumy/schema-form/formTypeDefinitions';
import {
  useExternalFormContext,
  useFormTypeInputsContext,
} from '@lumy/schema-form/providers';
import type { Hint } from '@lumy/schema-form/types';

/**
 * @description 스키마 노드에 대한 폼 타입 입력을 반환합니다.
 *   - FormTypeInputMap에 먼저 정의된 폼 타입 입력을 반환합니다.
 *   - FormTypeInputDefinitions에 정의된 폼 타입 입력을 반환합니다.
 *   - fallback FormTypeInputDefinitions에 정의된 폼 타입 입력을 반환합니다.
 * @param node - SchemaNode
 * @returns FormTypeInput
 */
export const useFormTypeInput = (node: SchemaNode) => {
  const { fromFormTypeInputMap, fromFormTypeInputDefinitions } =
    useFormTypeInputsContext();
  const { fromExternalFormTypeInputDefinitions } = useExternalFormContext();

  const FormTypeInput = useMemo(() => {
    // NOTE: formType이 React Component인 경우, 해당 Component를 반환합니다.
    const inlineFormType = node.jsonSchema?.formType;
    if (inlineFormType) {
      if (isFunctionComponent(inlineFormType))
        return memo(withErrorBoundary(inlineFormType));
      if (isMemoComponent(inlineFormType))
        return withErrorBoundary(inlineFormType);
    }

    const hint = getHint(node);
    // NOTE: FormTypeInputMap has higher priority than FormTypeInputDefinitions
    for (const { test, Component } of fromFormTypeInputMap) {
      if (test(hint)) return memo(Component);
    }
    // NOTE: FormTypeInputDefinitions has lower priority than FormTypeInputMap
    for (const { test, Component } of fromFormTypeInputDefinitions) {
      if (test(hint)) return memo(Component);
    }
    for (const { test, Component } of fromExternalFormTypeInputDefinitions) {
      if (test(hint)) return memo(Component);
    }
    // NOTE: fallback FormTypeInputDefinitions has lowest priority
    for (const { test, Component } of fromFallbackFormTypeInputDefinitions) {
      if (test(hint)) return memo(Component);
    }
    return null;
  }, [
    node,
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
