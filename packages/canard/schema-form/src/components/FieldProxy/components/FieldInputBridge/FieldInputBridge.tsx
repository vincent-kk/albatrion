import { memo, useCallback, useRef } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import { useMemorize, useOnUnmount } from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';

import { PluginManager } from '@/schema-form/app/plugin';
import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import { FieldNodeState } from '@/schema-form/core';
import {
  SetValueOption,
  finishFieldNodeInput,
  readFieldNodeInteractionReset,
  relayFieldNodeInput,
  writeFieldNodeInput,
} from '@/schema-form/core';
import {
  useInputControlContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useExternalInputContext } from '@/schema-form/providers/ExternalFormContext';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import { useInputRendererContext } from '@/schema-form/providers/FieldRendererContext';
import { useLiveNode } from '@/schema-form/providers/RootNodeContext';
import type { JSONSchema, SetStateFnWithOptions } from '@/schema-form/types';

import { resolveRequired } from '../../utils/resolveRequired';
import { useChildFields } from './hooks/useChildFields';
import { useFieldInput } from './hooks/useFieldInput';
import { useFieldInputControl } from './hooks/useFieldInputControl';
import { useFieldLifecycle } from './hooks/useFieldLifecycle';
import { useTerminalChildren } from './hooks/useTerminalChildren';
import type { FieldInputBridgeProps } from './type';
import { readFieldInputGeneration } from './utils/readFieldInputGeneration';
import { resolveControlled } from './utils/resolveControlled';

/** State patch that marks the field touched after blur. */
const TOUCHED_STATE_PATCH = { [FieldNodeState.Touched]: true };

/** Bind one input draft to the live node without treating typing as a caller refresh. */
export const FieldInputBridge = memo(
  ({
    node,
    unwrapped,
    onChangeRef,
    onFileAttachRef,
    overrideOnChangeRef,
    overrideOnFileAttachRef,
    overrideProps,
    PreferredFieldInput,
    NodeProxy,
  }: FieldInputBridgeProps) => {
    const selected = useFieldInput(node, PreferredFieldInput !== null);
    const FieldInput = PreferredFieldInput || (selected && selected.Component);
    const formInputRenderer = useInputRendererContext();
    const { InputRenderer: externalInputRenderer } = useExternalInputContext();
    const InputRenderer =
      formInputRenderer ||
      externalInputRenderer ||
      PluginManager.InputRenderer ||
      null;
    const Frame = FieldInput && !unwrapped ? InputRenderer : null;
    const presentation = (node.jsonSchema as JSONSchema).presentation;
    const inputProps = presentation?.FieldInputProps;
    const controlled = resolveControlled(
      PreferredFieldInput ? undefined : selected?.controlled,
      presentation?.controlled,
    );
    // Each selection gets its own generation, even when A returns after B.
    const selection = useMemorize(
      () => ({ active: false }),
      [FieldInput, Frame],
    );
    const mountedChildren = useRef(0);
    const [terminalChildren, commitTerminalChildren] =
      useTerminalChildren(node);
    const [ChildFields, hydrationCommitRef, virtualizationManager] =
      useChildFields(node, NodeProxy, mountedChildren, terminalChildren);
    const { attachedFilesMap, context } = useWorkspaceContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();
    const isLive = useLiveNode(node);
    const [
      ref,
      generation,
      handleCompositionStart,
      handleCompositionEnd,
      ,
      releaseComposition,
    ] = useFieldInputControl(node, mountedChildren, controlled);
    const lifecycle = useFieldLifecycleContext();
    const lifecycleRender = useFieldLifecycle(
      node,
      ref,
      commitTerminalChildren,
      releaseComposition,
      hydrationCommitRef,
      FieldInput ? virtualizationManager : null,
      FieldInput ? lifecycle : null,
      Frame,
    );
    const defaultValue = useMemorize(
      () => node.value,
      [node, generation, FieldInput, Frame],
    );
    const accepts = useCallback(
      () =>
        selection.active &&
        isLive() &&
        (mountedChildren.current > 0 ||
          generation === readFieldInputGeneration(node, controlled)),
      [node, generation, isLive, selection, controlled],
    );
    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, option = SetValueOption.Overwrite) => {
        if (
          !accepts() ||
          rootReadOnly ||
          rootDisabled ||
          node.isReadOnly ||
          node.isDisabled
        )
          return;
        const onChange = onChangeRef.current || overrideOnChangeRef?.current;
        if (!onChange) writeFieldNodeInput(node, input, option);
        else relayFieldNodeInput(node, input, option, onChange);
      },
      [
        accepts,
        rootReadOnly,
        rootDisabled,
        node,
        onChangeRef,
        overrideOnChangeRef,
      ],
    );
    const handleFileAttach = useCallback(
      (files: Optional<File | File[]>) => {
        if (!accepts()) return;
        const onFileAttach =
          onFileAttachRef.current || overrideOnFileAttachRef?.current;
        if (onFileAttach) return onFileAttach(files);
        if (files === undefined) attachedFilesMap.delete(node.path);
        else attachedFilesMap.set(node.path, isArray(files) ? files : [files]);
      },
      [
        accepts,
        node,
        onFileAttachRef,
        overrideOnFileAttachRef,
        attachedFilesMap,
      ],
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
    const required = resolveRequired(
      overrideProps.required,
      presentation?.required,
      node.isRequired,
    );
    const readOnly =
      rootReadOnly || node.isReadOnly || !!overrideProps.readOnly;
    const disabled =
      rootDisabled || node.isDisabled || !!overrideProps.disabled;
    const input = (
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
          placeholder={undefined}
          style={undefined}
          className={undefined}
          {...inputProps}
          {...overrideProps}
          defaultValue={defaultValue}
          value={node.value}
          required={required}
          onChange={handleChange}
          onFileAttach={handleFileAttach}
          readOnly={readOnly}
          disabled={disabled}
          inputGeneration={generation}
          inputSelection={selection}
          jsonSchema={node.jsonSchema as JSONSchema}
          node={node}
          type={node.type}
          schemaType={node.schemaType}
          misfit={node.isMisfit}
          name={node.name}
          path={node.path}
          nullable={node.nullable}
          watchValues={node.watchValues}
          ChildFields={ChildFields}
          context={context}
        />
        {lifecycleRender}
      </div>
    );
    return Frame ? (
      <Frame
        node={node}
        path={node.path}
        name={node.name}
        jsonSchema={node.jsonSchema}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        context={context}
      >
        {input}
      </Frame>
    ) : (
      input
    );
  },
);
