import { type ComponentType, type RefObject, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import {
  useLazyConstant,
  useReference,
  useSnapshot,
} from '@winglet/react-utils/hook';

import type { Nullable, Optional } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { withFieldInputErrorBoundary } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildFieldProps,
  FieldInputProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

import type { FieldProxyProps } from '../../../type';
import { FieldInputSlot } from '../FieldInputSlot';

export const FieldInputSlotWrapper = (
  node: Nullable<FieldNode>,
  overrideOnChangeRef: Optional<RefObject<ChildFieldProps['onChange']>>,
  overrideOnFileAttachRef: Optional<RefObject<ChildFieldProps['onFileAttach']>>,
  overrideFieldInputPropsRef: Optional<RefObject<OverridableFieldInputProps>>,
  OverridePreferredFieldInput: Optional<ComponentType<FieldInputProps>>,
  NodeProxy: ComponentType<FieldProxyProps>,
): ComponentType<ChildFieldProps> => {
  if (!node) return NULL_FUNCTION;
  // The node-specific factory survives FieldProxy's version key remount.
  const errorVisibilityMemory: RefObject<ReadonlyMap<FieldNode, boolean>> = {
    current: new Map(),
  };
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
        errorVisibilityMemory={errorVisibilityMemory}
        onChangeRef={onChangeRef}
        onFileAttachRef={onFileAttachRef}
        overrideProps={overrideProps}
        PreferredFieldInput={PreferredFieldInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
