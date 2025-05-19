import { type ComponentType, memo } from 'react';

import { nullFunction } from '@winglet/common-utils';
import {
  isReactComponent,
  useMemorize,
  useRestProperties,
  withErrorBoundary,
} from '@winglet/react-utils';

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
    const PreferredFormTypeInput = useMemorize(
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
