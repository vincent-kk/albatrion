import { memo, useCallback, useMemo, useRef } from 'react';

import { useConstant } from '@winglet/react-utils';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useFormTypeInput } from '@/schema-form/hooks/useFormTypeInput';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useRootNodeContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import {
  type SetStateFnWithOptions,
  SetStateOption,
} from '@/schema-form/types';

import type { SchemaNodeAdapterInputProps } from './type';

const RERENDERING_EVENT =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;

export const SchemaNodeAdapterInput = memo(
  ({
    node,
    overridableProps,
    PreferredFormTypeInput,
    childNodes,
  }: SchemaNodeAdapterInputProps) => {
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useRootNodeContext();
    const FormTypeInputByNode = useFormTypeInput(node);
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput || FormTypeInputByNode,
      [FormTypeInputByNode, PreferredFormTypeInput],
    );
    const defaultValue = useConstant(() => node.defaultValue);

    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, option = SetStateOption.Merge) => {
        if (node.readOnly || node.disabled) return;
        node.setValue(input, option);
        node.clearReceivedErrors();
        node.setState({ [NodeState.Dirty]: true });
      },
      [node],
    );

    const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();
    const handleFocus = useCallback(() => {
      if (!feedbackTimer.current) return;
      clearTimeout(feedbackTimer.current);
    }, []);
    const handleBlur = useCallback(() => {
      feedbackTimer.current = setTimeout(() => {
        node.setState({ [NodeState.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useUserDefinedContext();

    useSchemaNodeTracker(node, RERENDERING_EVENT);

    const version = useSchemaNodeTracker(node, NodeEventType.Refresh);

    if (!FormTypeInput) return null;

    return (
      <span onFocus={handleFocus} onBlur={handleBlur}>
        <FormTypeInput
          key={version}
          jsonSchema={node.jsonSchema}
          readOnly={rootReadOnly || node.readOnly}
          disabled={rootDisabled || node.disabled}
          node={node}
          childNodes={childNodes}
          name={node.name}
          path={node.path}
          errors={node.errors}
          watchValues={node.watchValues}
          defaultValue={defaultValue}
          value={node.value}
          onChange={handleChange}
          style={node.jsonSchema.style}
          context={userDefinedContext}
          {...overridableProps}
        />
      </span>
    );
  },
);
