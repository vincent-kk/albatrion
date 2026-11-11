import { memo, useCallback, useRef } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import { useMemorize, useOnUnmount } from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import { FieldNodeState } from '@/schema-form/core';
import {
  SetValueOption,
  finishFieldNodeInput,
  readFieldNodeInteractionReset,
  readFieldNodeRevealVersion,
  relayFieldNodeInput,
  writeFieldNodeInput,
} from '@/schema-form/core';
import {
  useFieldRendererContext,
  useInputControlContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import {
  ErrorRevealSubscriber,
  isErrorRevealed,
} from '@/schema-form/providers/FieldRendererContext';
import { useLiveNode } from '@/schema-form/providers/RootNodeContext';
import type { JSONSchema, SetStateFnWithOptions } from '@/schema-form/types';

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
    const controlled = resolveControlled(
      PreferredFieldInput ? undefined : selected?.controlled,
      (node.jsonSchema as JSONSchema).presentation?.controlled,
    );
    // Each selection gets its own generation, even when A returns after B.
    const selection = useMemorize(() => ({ active: false }), [FieldInput]);
    const mountedChildren = useRef(0);
    const [terminalChildren, commitTerminalChildren] =
      useTerminalChildren(node);
    const [ChildFields, hydrationCommitRef, virtualizationManager] =
      useChildFields(node, NodeProxy, mountedChildren, terminalChildren);
    const { checkErrorVisibility, errorVisibility } = useFieldRendererContext();
    const live = node.isPresent && checkErrorVisibility(node.state);
    const errorVisible = live && isErrorRevealed(node, errorVisibility, true);
    const revealVersion =
      live && !errorVisible ? readFieldNodeRevealVersion(node) : undefined;
    const { attachedFilesMap, context } = useWorkspaceContext();
    const { readOnly: rootReadOnly, disabled: rootDisabled } =
      useInputControlContext();
    const isLive = useLiveNode(node);
    const [
      ref,
      generation,
      handleCompositionStart,
      handleCompositionEnd,
      rerender,
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
    );
    const defaultValue = useMemorize(
      () => node.value,
      [node, generation, FieldInput],
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
          required={node.isRequired}
          placeholder={undefined}
          style={undefined}
          className={undefined}
          {...(node.jsonSchema as JSONSchema).presentation?.FieldInputProps}
          defaultValue={defaultValue}
          value={node.value}
          onChange={handleChange}
          onFileAttach={handleFileAttach}
          {...overrideProps}
          readOnly={rootReadOnly || node.isReadOnly || !!overrideProps.readOnly}
          disabled={rootDisabled || node.isDisabled || !!overrideProps.disabled}
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
          errors={node.errors}
          errorVisible={errorVisible}
          watchValues={node.watchValues}
          ChildFields={ChildFields}
          context={context}
        />
        {revealVersion !== undefined && (
          <ErrorRevealSubscriber
            node={node}
            version={revealVersion}
            onRelease={rerender}
          />
        )}
        {lifecycleRender}
      </div>
    );
  },
);
