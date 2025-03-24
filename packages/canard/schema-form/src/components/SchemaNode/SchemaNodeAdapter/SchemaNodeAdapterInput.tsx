import { memo, useCallback, useMemo, useRef } from 'react';

import { useConstant } from '@winglet/react-utils';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useFormTypeInput } from '@/schema-form/hooks/useFormTypeInput';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import { useUserDefinedContext } from '@/schema-form/providers';
import type { SetStateFnWithOptions } from '@/schema-form/types';

import type { SchemaNodeAdapterInputProps } from './type';

export const SchemaNodeAdapterInput = memo(
  ({
    node,
    readOnly,
    disabled,
    watchValues,
    overridableProps,
    PreferredFormTypeInput,
    childNodes,
  }: SchemaNodeAdapterInputProps) => {
    const FormTypeInputByNode = useFormTypeInput(node);
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput || FormTypeInputByNode,
      [FormTypeInputByNode, PreferredFormTypeInput],
    );

    const defaultValue = useConstant(() => node.defaultValue);

    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, options) => {
        if (disabled || readOnly) return;
        node.setValue(input, options);
        node.clearReceivedErrors();
        node.setState({ [NodeState.Dirty]: true });
      },
      [node, disabled, readOnly],
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

    useSchemaNodeTracker(
      node,
      NodeEventType.Change | NodeEventType.UpdateError,
    );

    if (!node || !FormTypeInput) return null;

    return (
      <span onFocus={handleFocus} onBlur={handleBlur}>
        <FormTypeInput
          jsonSchema={node.jsonSchema}
          readOnly={readOnly}
          disabled={disabled}
          node={node}
          childNodes={childNodes}
          name={node.name}
          path={node.path}
          errors={node.errors}
          watchValues={watchValues}
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
