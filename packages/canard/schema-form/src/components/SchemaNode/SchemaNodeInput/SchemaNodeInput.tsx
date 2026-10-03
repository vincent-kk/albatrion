import { memo, useCallback, useRef } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import { useMemorize, useOnUnmount } from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/app/constants';
import {
  SchemaNodeEventType,
  SetValueOption,
  finishSchemaNodeInput,
  readSchemaNodeInteractionReset,
  writeSchemaNodeInput,
} from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useInputControlContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useLiveNode } from '@/schema-form/providers/RootNodeContext';
import type { JSONSchema, SetStateFnWithOptions } from '@/schema-form/types';

import { useChildNodeComponents } from './hooks/useChildNodeComponents';
import { useFormTypeInput } from './hooks/useFormTypeInput';
import { useFormTypeInputControl } from './hooks/useFormTypeInputControl';
import { REACTIVE_RERENDERING_EVENTS, type SchemaNodeInputProps } from './type';

/** Bind one input draft to the live node without treating typing as a caller refresh. */
export const SchemaNodeInput = memo(
  ({
    node,
    onChangeRef,
    onFileAttachRef,
    overrideProps,
    PreferredFormTypeInput,
    NodeProxy,
  }: SchemaNodeInputProps) => {
    const selected = useFormTypeInput(node, PreferredFormTypeInput !== null);
    const FormTypeInput = PreferredFormTypeInput || selected;
    const mountedChildren = useRef(0);
    const ChildNodeComponents = useChildNodeComponents(
      node,
      NodeProxy,
      mountedChildren,
    );
    const { checkShowError } = useFormTypeRendererContext();
    const { attachedFilesMap, context } = useWorkspaceContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();
    const isLive = useLiveNode(node);
    const [ref, generation, handleCompositionStart, handleCompositionEnd] =
      useFormTypeInputControl(node, mountedChildren);
    const defaultValue = useMemorize(() => node.value, [node, generation]);
    const accepts = useCallback(
      () =>
        isLive() &&
        (mountedChildren.current > 0 ||
          generation === node.revision(SchemaNodeEventType.RequestRefresh)),
      [node, generation, isLive],
    );
    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, option = SetValueOption.Overwrite) => {
        if (
          !accepts() ||
          rootReadOnly ||
          rootDisabled ||
          node.readOnly ||
          node.disabled
        )
          return;
        if (!onChangeRef.current) writeSchemaNodeInput(node, input, option);
        else
          node.batch(() => {
            onChangeRef.current!(input, option);
            node.clearExternalErrors();
            node.setState({ 1: true });
          });
      },
      [accepts, rootReadOnly, rootDisabled, node, onChangeRef],
    );
    const handleFileAttach = useCallback(
      (files: File | File[] | undefined) => {
        if (!accepts()) return;
        if (onFileAttachRef.current) return onFileAttachRef.current(files);
        if (files === undefined) attachedFilesMap.delete(node.path);
        else attachedFilesMap.set(node.path, isArray(files) ? files : [files]);
      },
      [accepts, node, onFileAttachRef, attachedFilesMap],
    );
    const requestId =
      useRef<ReturnType<typeof requestAnimationFrame>>(undefined);
    const handleFocus = useCallback(() => {
      if (requestId.current !== undefined)
        cancelAnimationFrame(requestId.current);
      requestId.current = undefined;
    }, []);
    const handleBlur = useCallback(() => {
      if (!accepts()) return;
      const reset = readSchemaNodeInteractionReset(node);
      finishSchemaNodeInput(node);
      if (node.state[2]) return;
      requestId.current = requestAnimationFrame(() => {
        if (
          isLive() &&
          reset === readSchemaNodeInteractionReset(node) &&
          !node.state[2]
        )
          node.setState({ 2: true });
      });
    }, [accepts, isLive, node]);
    useOnUnmount(() => {
      attachedFilesMap.delete(node.path);
      if (requestId.current !== undefined)
        cancelAnimationFrame(requestId.current);
    });
    useSchemaNodeTracker(node, REACTIVE_RERENDERING_EVENTS);
    if (!FormTypeInput) return null;
    return (
      <div
        ref={ref}
        role={NONE_ROLE}
        style={DISPLAY_CONTENT}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCompositionStartCapture={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      >
        <FormTypeInput
          required={node.required}
          placeholder={undefined}
          style={undefined}
          className={undefined}
          {...(node.jsonSchema as JSONSchema).presentation?.FormTypeInputProps}
          defaultValue={defaultValue}
          value={node.value}
          onChange={handleChange}
          onFileAttach={handleFileAttach}
          {...overrideProps}
          readOnly={rootReadOnly || node.readOnly || !!overrideProps.readOnly}
          disabled={rootDisabled || node.disabled || !!overrideProps.disabled}
          key={generation}
          jsonSchema={node.jsonSchema as JSONSchema}
          node={node}
          type={node.type}
          schemaType={node.schemaType}
          typeMismatch={node.typeMismatch}
          name={node.name}
          path={node.path}
          nullable={node.nullable}
          errors={node.errors}
          errorVisible={checkShowError(node.state)}
          watchValues={node.watchValues}
          ChildNodeComponents={ChildNodeComponents}
          context={context}
        />
      </div>
    );
  },
);
