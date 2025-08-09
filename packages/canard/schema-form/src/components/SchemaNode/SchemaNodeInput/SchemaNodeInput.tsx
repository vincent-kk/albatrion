import { memo, useCallback, useMemo, useRef, useState } from 'react';

import { useConstant } from '@winglet/react-utils/hook';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useInputControlContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { SetStateFnWithOptions } from '@/schema-form/types';

import { useChildNodeComponents } from './hooks/useChildNodeComponents';
import { useFormTypeInput } from './hooks/useFormTypeInput';
import { useFormTypeInputControl } from './hooks/useFormTypeInputControl';
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
    const MemorizedFormTypeInput = useConstant(
      PreferredFormTypeInput ? memo(PreferredFormTypeInput) : null,
    );
    const FormTypeInput = useMemo(
      () => MemorizedFormTypeInput || FormTypeInputByNode,
      [MemorizedFormTypeInput, FormTypeInputByNode],
    );
    const ChildNodeComponents = useChildNodeComponents(node, NodeProxy);
    const containerRef = useRef<HTMLSpanElement>(null);

    const sync = useMemo(() => node.group === 'terminal', [node.group]);
    const [value, setValue] = useState(sync ? node.value : undefined);
    useSchemaNodeSubscribe(sync ? node : null, ({ type, payload }) => {
      if (type === NodeEventType.UpdateValue)
        setValue(payload?.[NodeEventType.UpdateValue]);
    });

    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, option = HANDLE_CHANGE_OPTION) => {
        if (node.readOnly || node.disabled) return;
        node.setValue(input, option);
        if (sync) setValue(node.value);
        node.clearExternalErrors();
        if (!node.state[NodeState.Dirty])
          node.setState({ [NodeState.Dirty]: true });
      },
      [node, sync],
    );

    const requestId =
      useRef<ReturnType<typeof requestAnimationFrame>>(undefined);
    const handleFocus = useCallback(() => {
      node.publish({ type: NodeEventType.Focused });
      if (requestId.current === undefined) return;
      cancelAnimationFrame(requestId.current);
      requestId.current = undefined;
    }, [node]);

    const handleBlur = useCallback(() => {
      node.publish({ type: NodeEventType.Blurred });
      if (node.state[NodeState.Touched]) return;
      requestId.current = requestAnimationFrame(() => {
        if (!node.state[NodeState.Touched])
          node.setState({ [NodeState.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useUserDefinedContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();

    const version = useFormTypeInputControl(node, containerRef);
    useSchemaNodeTracker(node, RERENDERING_EVENT);

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
          value={sync ? value : node.value}
          onChange={handleChange}
          ChildNodeComponents={ChildNodeComponents}
          style={node.jsonSchema.style}
          context={userDefinedContext}
          {...node.jsonSchema.FormTypeInputProps}
          {...overrideProps}
        />
      </span>
    );
  },
);
