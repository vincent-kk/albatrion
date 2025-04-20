import { type ComponentType, memo } from 'react';

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
import { SchemaNodeAdapter } from './SchemaNodeAdapter';

export const SchemaNodeAdapterWrapper = (
  node: SchemaNode | null,
  overrideFormTypeInputProps: OverridableFormTypeInputProps | undefined,
  OverridePreferredFormTypeInput: ComponentType<FormTypeInputProps> | undefined,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
) => {
  return function SchemaNodeAdapterWrapperInner(
    preferredOverrideProps: OverridableFormTypeInputProps,
  ) {
    const overrideProps = useRestProperties({
      ...overrideFormTypeInputProps,
      ...preferredOverrideProps,
    });
    const PreferredFormTypeInput = useMemorize(
      isReactComponent(OverridePreferredFormTypeInput)
        ? memo(withErrorBoundary(OverridePreferredFormTypeInput))
        : undefined,
    );
    if (!node) return null;
    return (
      <SchemaNodeAdapter
        node={node}
        overrideProps={overrideProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
