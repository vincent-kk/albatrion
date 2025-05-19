import { memo, useCallback, useMemo, useRef } from 'react';

import { NodeEventType, NodeState, SetValueOption } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useInputControlContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { SetStateFnWithOptions } from '@/schema-form/types';

import { useChildNodes } from './hooks/useChildNodes';
import { useFormTypeInput } from './hooks/useFormTypeInput';
import type { SchemaNodeInputProps } from './type';

const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

const RERENDERING_EVENT =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;

export const SchemaNodeInput = memo(
  ({
    node,
    overrideProps,
    PreferredFormTypeInput,
    NodeProxy,
  }: SchemaNodeInputProps) => {
    const FormTypeInputByNode = useFormTypeInput(node);
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput || FormTypeInputByNode,
      [FormTypeInputByNode, PreferredFormTypeInput],
    );

    const ChildNodes = useChildNodes(node, NodeProxy);

    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, option = HANDLE_CHANGE_OPTION) => {
        if (node.readOnly || node.disabled) return;
        node.setValue(input, option);
        node.clearExternalErrors();
        if (!node.state[NodeState.Dirty])
          node.setState({ [NodeState.Dirty]: true });
      },
      [node],
    );

    const requestId =
      useRef<ReturnType<typeof requestAnimationFrame>>(undefined);
    const handleFocus = useCallback(() => {
      if (requestId.current === undefined) return;
      cancelAnimationFrame(requestId.current);
      requestId.current = undefined;
    }, []);
    const handleBlur = useCallback(() => {
      if (node.state[NodeState.Touched]) return;
      requestId.current = requestAnimationFrame(() => {
        if (!node.state[NodeState.Touched])
          node.setState({ [NodeState.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useUserDefinedContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();

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
          required={node.required}
          node={node}
          ChildNodes={ChildNodes}
          name={node.name}
          path={node.path}
          errors={node.errors}
          watchValues={node.watchValues}
          defaultValue={node.defaultValue}
          value={node.value}
          onChange={handleChange}
          style={node.jsonSchema.style}
          context={userDefinedContext}
          {...overrideProps}
        />
      </span>
    );
  },
);
