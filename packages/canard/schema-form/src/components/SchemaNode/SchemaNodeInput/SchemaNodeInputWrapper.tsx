import { type ComponentType, type RefObject, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import {
  useLazyConstant,
  useReference,
  useSnapshot,
} from '@winglet/react-utils/hook';

import type { SchemaNode } from '@/schema-form/core';
import { withFieldInputErrorBoundary } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildNodeComponentProps,
  FieldInputProps,
  OverridableFieldInputProps,
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
  overrideFieldInputPropsRef: RefObject<OverridableFieldInputProps> | undefined,
  OverridePreferredFieldInput: ComponentType<FieldInputProps> | undefined,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
): ComponentType<ChildNodeComponentProps> => {
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
      ...overrideFieldInputPropsRef?.current,
      ...preferredOverrideProps,
    });
    const PreferredFieldInput = useLazyConstant(() =>
      OverridePreferredFieldInput &&
      isReactComponent(OverridePreferredFieldInput)
        ? isMemoComponent(OverridePreferredFieldInput)
          ? withFieldInputErrorBoundary(OverridePreferredFieldInput)
          : memo(withFieldInputErrorBoundary(OverridePreferredFieldInput))
        : null,
    );
    return (
      <SchemaNodeInput
        node={node}
        onChangeRef={onChangeRef}
        onFileAttachRef={onFileAttachRef}
        overrideProps={overrideProps}
        PreferredFieldInput={PreferredFieldInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
