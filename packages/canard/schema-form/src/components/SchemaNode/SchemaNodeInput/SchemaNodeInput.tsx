import { memo, useCallback, useMemo, useRef } from 'react';

import { useOnUnmount } from '@winglet/react-utils/hook';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useInputControlContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import type { SetStateFnWithOptions } from '@/schema-form/types';

import { useChildNodeComponents } from './hooks/useChildNodeComponents';
import { useFormTypeInput } from './hooks/useFormTypeInput';
import { useFormTypeInputControl } from './hooks/useFormTypeInputControl';
import {
  HANDLE_CHANGE_OPTION,
  REACTIVE_RERENDERING_EVENTS,
  type SchemaNodeInputProps,
} from './type';

export const SchemaNodeInput = memo(
  ({
    node,
    overrideProps,
    PreferredFormTypeInput,
    NodeProxy,
  }: SchemaNodeInputProps) => {
    const FormTypeInputByNode = useFormTypeInput(
      node,
      PreferredFormTypeInput !== null,
    );
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput || FormTypeInputByNode,
      [PreferredFormTypeInput, FormTypeInputByNode],
    );
    const ChildNodeComponents = useChildNodeComponents(node, NodeProxy);
    const containerRef = useRef<HTMLSpanElement>(null);

    const { attachedFileMap, context } = useWorkspaceContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();

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

    const handleFileAttach = useCallback(
      (file: File | File[] | undefined) => {
        if (file) attachedFileMap.set(node.path, file);
        else attachedFileMap.delete(node.path);
      },
      [attachedFileMap, node.path],
    );

    const requestId =
      useRef<ReturnType<typeof requestAnimationFrame>>(undefined);
    const handleFocus = useCallback(() => {
      node.publish(NodeEventType.Focused);
      if (requestId.current === undefined) return;
      cancelAnimationFrame(requestId.current);
      requestId.current = undefined;
    }, [node]);

    const handleBlur = useCallback(() => {
      node.publish(NodeEventType.Blurred);
      if (node.state[NodeState.Touched]) return;
      requestId.current = requestAnimationFrame(() => {
        if (!node.state[NodeState.Touched])
          node.setState({ [NodeState.Touched]: true });
      });
    }, [node]);

    useOnUnmount(() => {
      attachedFileMap.delete(node.path);
      if (requestId.current === undefined) return;
      cancelAnimationFrame(requestId.current);
    });

    const version = useFormTypeInputControl(node, containerRef);
    useSchemaNodeTracker(node, REACTIVE_RERENDERING_EVENTS);

    if (!FormTypeInput) return null;

    return (
      <span ref={containerRef} onFocus={handleFocus} onBlur={handleBlur}>
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
          onFileAttach={handleFileAttach}
          ChildNodeComponents={ChildNodeComponents}
          style={node.jsonSchema.style}
          context={context}
          {...node.jsonSchema.FormTypeInputProps}
          {...overrideProps}
        />
      </span>
    );
  },
);
