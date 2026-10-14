import { type ComponentType, type RefObject, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import {
  useLazyConstant,
  useReference,
  useSnapshot,
} from '@winglet/react-utils/hook';

import type { FieldNode } from '@/schema-form/core';
import { withFieldInputErrorBoundary } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildFieldProps,
  FieldInputProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

import type { FieldProxyProps } from '../FieldProxy';
import { FieldInputSlot } from './FieldInputSlot';

export const FieldInputSlotWrapper = (
  node: FieldNode | null,
  overrideOnChangeRef: RefObject<ChildFieldProps['onChange']> | undefined,
  overrideOnFileAttachRef:
    | RefObject<ChildFieldProps['onFileAttach']>
    | undefined,
  overrideFieldInputPropsRef: RefObject<OverridableFieldInputProps> | undefined,
  OverridePreferredFieldInput: ComponentType<FieldInputProps> | undefined,
  NodeProxy: ComponentType<FieldProxyProps>,
): ComponentType<ChildFieldProps> => {
  if (!node) return NULL_FUNCTION;
  return ({
    onChange: preferredOnChange,
    onFileAttach: preferredOnFileAttach,
    ...preferredOverrideProps
  }: ChildFieldProps) => {
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
      <FieldInputSlot
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
