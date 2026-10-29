import { memo, useCallback, useRef } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import { useMemorize, useOnUnmount } from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import {
  FieldNodeEventType,
  SetValueOption,
  finishFieldNodeInput,
  readFieldNodeInteractionReset,
  writeFieldNodeInput,
} from '@/schema-form/core';
import {
  useFieldRendererContext,
  useInputControlContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useLiveNode } from '@/schema-form/providers/RootNodeContext';
import type { JSONSchema, SetStateFnWithOptions } from '@/schema-form/types';

import { useChildFields } from './hooks/useChildFields';
import { useFieldInput } from './hooks/useFieldInput';
import { useFieldInputControl } from './hooks/useFieldInputControl';
import { useTerminalChildren } from './hooks/useTerminalChildren';
import type { FieldInputSlotProps } from './type';

/** State patch that marks the field dirty after a controlled change. */
const DIRTY_STATE_PATCH = { 1: true };

/** State patch that marks the field touched after blur. */
const TOUCHED_STATE_PATCH = { 2: true };

/** Bind one input draft to the live node without treating typing as a caller refresh. */
export const FieldInputSlot = memo(
  ({
    node,
    onChangeRef,
    onFileAttachRef,
    overrideProps,
    PreferredFieldInput,
    NodeProxy,
  }: FieldInputSlotProps) => {
    const selected = useFieldInput(node, PreferredFieldInput !== null);
    const FieldInput = PreferredFieldInput || selected;
    const mountedChildren = useRef(0);
    const [terminalChildren, commitTerminalChildren] =
      useTerminalChildren(node);
    const ChildFields = useChildFields(
      node,
      NodeProxy,
      mountedChildren,
      terminalChildren,
    );
    const { checkShowError } = useFieldRendererContext();
    const { attachedFilesMap, context } = useWorkspaceContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();
    const isLive = useLiveNode(node);
    const [ref, generation, handleCompositionStart, handleCompositionEnd] =
      useFieldInputControl(node, mountedChildren, commitTerminalChildren);
    const defaultValue = useMemorize(() => node.value, [node, generation]);
    const accepts = useCallback(
      () =>
        isLive() &&
        (mountedChildren.current > 0 ||
          generation === node.revision(FieldNodeEventType.RequestRefresh)),
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
        if (!onChangeRef.current) writeFieldNodeInput(node, input, option);
        else
          node.batch(() => {
            onChangeRef.current!(input, option);
            node.clearExternalErrors();
            node.setState(DIRTY_STATE_PATCH);
          });
      },
      [accepts, rootReadOnly, rootDisabled, node, onChangeRef],
    );
    const handleFileAttach = useCallback(
      (files: Optional<File | File[]>) => {
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
      const reset = readFieldNodeInteractionReset(node);
      finishFieldNodeInput(node);
      if (node.state[2]) return;
      requestId.current = requestAnimationFrame(() => {
        if (
          isLive() &&
          reset === readFieldNodeInteractionReset(node) &&
          !node.state[2]
        )
          node.setState(TOUCHED_STATE_PATCH);
      });
    }, [accepts, isLive, node]);
    useOnUnmount(() => {
      attachedFilesMap.delete(node.path);
      if (requestId.current !== undefined)
        cancelAnimationFrame(requestId.current);
    });
    if (!FieldInput) return null;
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
        <FieldInput
          required={node.required}
          placeholder={undefined}
          style={undefined}
          className={undefined}
          {...(node.jsonSchema as JSONSchema).presentation?.FieldInputProps}
          defaultValue={defaultValue}
          value={node.value}
          onChange={handleChange}
          onFileAttach={handleFileAttach}
          {...overrideProps}
          readOnly={rootReadOnly || node.readOnly || !!overrideProps.readOnly}
          disabled={rootDisabled || node.disabled || !!overrideProps.disabled}
          inputGeneration={generation}
          jsonSchema={node.jsonSchema as JSONSchema}
          node={node}
          type={node.type}
          schemaType={node.schemaType}
          misfit={node.misfit}
          name={node.name}
          path={node.path}
          nullable={node.nullable}
          errors={node.errors}
          errorVisible={checkShowError(node.state)}
          watchValues={node.watchValues}
          ChildFields={ChildFields}
          context={context}
        />
      </div>
    );
  },
);
