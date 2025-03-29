import { memo, useMemo } from 'react';

import {
  isFunctionComponent,
  isMemoComponent,
  withErrorBoundary,
} from '@winglet/react-utils';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import type { SchemaNode } from '@/schema-form/core';
import {
  useExternalFormContext,
  useFormTypeInputsContext,
} from '@/schema-form/providers';
import type { Hint } from '@/schema-form/types';

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
    const InlineFormType = node.jsonSchema?.FormType;
    if (InlineFormType) {
      if (isFunctionComponent(InlineFormType))
        return memo(withErrorBoundary(InlineFormType));
      if (isMemoComponent(InlineFormType))
        return withErrorBoundary(InlineFormType);
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

    // NOTE: ExternalFormTypeInputDefinitions has lowest priority, it run only if it exists
    if (fromExternalFormTypeInputDefinitions) {
      for (const { test, Component } of fromExternalFormTypeInputDefinitions) {
        if (test(hint)) return memo(Component);
      }
    }

    // NOTE: fallback FormTypeInputDefinitions has lowest priority
    const fallbackDefinitions = FallbackManager.formTypeInputDefinitions;
    for (const { test, Component } of fallbackDefinitions) {
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
