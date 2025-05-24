import { memo, useCallback, useMemo, useRef } from 'react';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useInputControlContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { SetStateFnWithOptions } from '@/schema-form/types';

import { useChildNodeComponents } from './hooks/useChildNodeComponents';
import { useFormTypeInput } from './hooks/useFormTypeInput';
import {
  HANDLE_CHANGE_OPTION,
  RERENDERING_EVENT,
  type SchemaNodeInputProps,
} from './type';

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

    const ChildNodeComponents = useChildNodeComponents(node, NodeProxy);

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
          name={node.name}
          path={node.path}
          errors={node.errors}
          watchValues={node.watchValues}
          defaultValue={node.defaultValue}
          value={node.value}
          onChange={handleChange}
          ChildNodeComponents={ChildNodeComponents}
          style={node.jsonSchema.style}
          context={userDefinedContext}
          {...overrideProps}
        />
      </span>
    );
  },
);
