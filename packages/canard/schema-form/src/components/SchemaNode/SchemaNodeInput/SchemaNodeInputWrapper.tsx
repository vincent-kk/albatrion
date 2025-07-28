import { type ComponentType, memo } from 'react';

import { nullFunction } from '@winglet/common-utils/constant';
import { isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { useConstant, useRestProperties } from '@winglet/react-utils/hook';

import type { SchemaNode } from '@/schema-form/core';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';
import { SchemaNodeInput } from './SchemaNodeInput';

export const SchemaNodeInputWrapper = (
  node: SchemaNode | null,
  overrideFormTypeInputProps: OverridableFormTypeInputProps | undefined,
  OverridePreferredFormTypeInput: ComponentType<FormTypeInputProps> | undefined,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
) => {
  if (!node) return nullFunction;
  return (preferredOverrideProps: OverridableFormTypeInputProps) => {
    const overrideProps = useRestProperties({
      ...overrideFormTypeInputProps,
      ...preferredOverrideProps,
    });
    const PreferredFormTypeInput = useConstant(
      isReactComponent(OverridePreferredFormTypeInput)
        ? memo(withErrorBoundary(OverridePreferredFormTypeInput))
        : undefined,
    );
    return (
      <SchemaNodeInput
        node={node}
        overrideProps={overrideProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
