import { type ComponentType, type RefObject, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import {
  useMemorize,
  useReference,
  useSnapshot,
} from '@winglet/react-utils/hook';

import type { SchemaNode } from '@/schema-form/core';
import type {
  ChildNodeComponentProps,
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';
import { SchemaNodeInput } from './SchemaNodeInput';

export const SchemaNodeInputWrapper = (
  node: SchemaNode | null,
  overrideOnChangeRef:
    | RefObject<ChildNodeComponentProps['onChange']>
    | undefined,
  overrideOnFileAttachRef:
    | RefObject<ChildNodeComponentProps['onFileAttach']>
    | undefined,
  overrideFormTypeInputPropsRef:
    | RefObject<OverridableFormTypeInputProps>
    | undefined,
  OverridePreferredFormTypeInput: ComponentType<FormTypeInputProps> | undefined,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
) => {
  if (!node) return NULL_FUNCTION;
  return ({
    onChange: preferredOnChange,
    onFileAttach: preferredOnFileAttach,
    ...preferredOverrideProps
  }: ChildNodeComponentProps) => {
    const onChangeRef = useReference(
      preferredOnChange || overrideOnChangeRef?.current,
    );
    const onFileAttachRef = useReference(
      preferredOnFileAttach || overrideOnFileAttachRef?.current,
    );
    const overrideProps = useSnapshot({
      ...overrideFormTypeInputPropsRef?.current,
      ...preferredOverrideProps,
    });
    const PreferredFormTypeInput = useMemorize(() =>
      OverridePreferredFormTypeInput &&
      isReactComponent(OverridePreferredFormTypeInput)
        ? isMemoComponent(OverridePreferredFormTypeInput)
          ? withErrorBoundary(OverridePreferredFormTypeInput)
          : memo(withErrorBoundary(OverridePreferredFormTypeInput))
        : null,
    );
    return (
      <SchemaNodeInput
        node={node}
        onChangeRef={onChangeRef}
        onFileAttachRef={onFileAttachRef}
        overrideProps={overrideProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
