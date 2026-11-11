import { type ComponentType, type RefObject, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent, isReactComponent } from '@winglet/react-utils/filter';
import {
  useLazyConstant,
  useReference,
  useSnapshot,
} from '@winglet/react-utils/hook';

import type { Nullish, Optional } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { withFieldInputErrorBoundary } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildFieldProps,
  FieldInputProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

import type { FieldProxyProps } from '../../../type';
import { FieldInputBridge } from '../FieldInputBridge';

/**
 * Bind a real node to an input component, or reuse the shared empty component.
 * @param node - Observed node; null or undefined renders no input
 * @param overrideOnChangeRef - Current parent change handler, when supplied
 * @param overrideOnFileAttachRef - Current parent attachment handler, when supplied
 * @param overrideFieldInputPropsRef - Parent props overridden by child props
 * @param OverridePreferredFieldInput - Parent input preference resolved once per mount
 * @param NodeProxy - Required renderer for real child nodes
 * @returns A bound input component, or the shared NULL_FUNCTION for absence
 */
export const createFieldInputBridge = (
  node: FieldNode | Nullish,
  overrideOnChangeRef: Optional<RefObject<ChildFieldProps['onChange']>>,
  overrideOnFileAttachRef: Optional<RefObject<ChildFieldProps['onFileAttach']>>,
  overrideFieldInputPropsRef: Optional<RefObject<OverridableFieldInputProps>>,
  OverridePreferredFieldInput: Optional<ComponentType<FieldInputProps>>,
  NodeProxy: ComponentType<FieldProxyProps>,
): ComponentType<ChildFieldProps> => {
  if (node == null) return NULL_FUNCTION;
  return ({
    onChange: preferredOnChange,
    onFileAttach: preferredOnFileAttach,
    ...preferredOverrideProps
  }: ChildFieldProps) => {
    const onChangeRef = useReference(preferredOnChange);
    const onFileAttachRef = useReference(preferredOnFileAttach);
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
      <FieldInputBridge
        node={node}
        onChangeRef={onChangeRef}
        onFileAttachRef={onFileAttachRef}
        overrideOnChangeRef={overrideOnChangeRef}
        overrideOnFileAttachRef={overrideOnFileAttachRef}
        overrideProps={overrideProps}
        PreferredFieldInput={PreferredFieldInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
