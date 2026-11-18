import { memo, useCallback, useRef } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import {
  useMemorize,
  useOnUnmount,
} from '@winglet/react-utils/hook';

import type { Nullable, Optional } from '@aileron/declare';

import { PluginManager } from '@/schema-form/app/plugin';
import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import { FieldNodeState } from '@/schema-form/core';
import {
  SetValueOption,
  finishFieldNodeInput,
  readFieldNodeInteractionEpoch,
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

import { resolveRequired } from '../../utils/required/resolveRequired';
import { useChildFields } from './hooks/useChildFields';
import { useFieldInput } from './hooks/useFieldInput';
import { useFieldInputControl } from './hooks/useFieldInputControl';
import { useFieldLifecycle } from './hooks/useFieldLifecycle';
import { useTerminalChildren } from './hooks/useTerminalChildren';
import type { FieldInputBridgeProps } from './type';
import { readFieldInputGeneration } from './utils/readFieldInputGeneration';
import { resolveControlled } from './utils/resolveControlled';

/** State patch that marks the field touched after blur. */
const TOUCHED_STATE_PATCH = { [FieldNodeState.Touched]: true } as const;

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
    const mountedChildren = useRef(0);
    const [terminalChildren, commitTerminalChildren] =
      useTerminalChildren(node);
    const [ChildFields, hydrationCommitRef, virtualizationManager, childValueRevision] =
      useChildFields(
        node,
        NodeProxy,
        mountedChildren,
        terminalChildren,
      );
    if (
      node.strategy === 'branch' &&
      (childValueRevision.node !== node ||
        childValueRevision.input !== FieldInput ||
        childValueRevision.frame !== Frame ||
        childValueRevision.isControlled !== (controlled === true))
    ) {
      childValueRevision.node = node;
      childValueRevision.input = FieldInput;
      childValueRevision.frame = Frame;
      childValueRevision.isControlled = controlled === true;
      childValueRevision.externalValueRevision = undefined;
    }
    const { attachedFilesMap, context } = useWorkspaceContext();
    const attachmentOwner = useRef<{ container: Nullable<HTMLDivElement> }>({
      container: null,
    });
    const {
      readOnly: rootReadOnly,
      disabled: rootDisabled,
      committedLockRef,
    } = useInputControlContext();
    const isLive = useLiveNode(node);
    const [
      ref,
      generation,
      handleCompositionStart,
      handleCompositionEnd,
      update,
      releaseComposition,
    ] = useFieldInputControl(
      node,
      mountedChildren,
      controlled,
      childValueRevision,
    );
    const lifecycle = useFieldLifecycleContext();
    const position = useFieldLifecycle(
      node,
      ref,
      commitTerminalChildren,
      releaseComposition,
      hydrationCommitRef,
      FieldInput ? virtualizationManager : null,
      FieldInput ? lifecycle : null,
      update,
      attachedFilesMap,
    );
    // Each committed container and input selection owns its callback lifetime.
    const selection = useMemorize(
      () => ({ active: false }),
      [FieldInput, position.epoch, controlled === true],
    );
    const accepts = useCallback(
      () =>
        selection.active &&
        isLive() &&
        (mountedChildren.current > 0 ||
          generation ===
            readFieldInputGeneration(
              node,
              controlled,
              childValueRevision.externalValueRevision,
            )),
      [node, generation, isLive, selection, controlled, childValueRevision, mountedChildren],
    );
    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (value, option = SetValueOption.Overwrite) => {
        if (
          !accepts() ||
          committedLockRef.current ||
          node.isReadOnly ||
          node.isDisabled
        )
          return;
        const onChange = onChangeRef.current || overrideOnChangeRef?.current;
        if (!onChange) writeFieldNodeInput(node, value, option);
        else relayFieldNodeInput(node, value, option, onChange);
      },
      [accepts, committedLockRef, node, onChangeRef, overrideOnChangeRef],
    );
    const handleFileAttach = useCallback(
      (files: Optional<File | File[]>) => {
        if (
          !accepts() ||
          committedLockRef.current ||
          node.isReadOnly ||
          node.isDisabled
        )
          return;
        const onFileAttach =
          onFileAttachRef.current || overrideOnFileAttachRef?.current;
        if (onFileAttach) return onFileAttach(files);
        attachmentOwner.current.container = ref.current;
        attachedFilesMap.attach(
          attachmentOwner.current,
          node,
          files === undefined ? undefined : isArray(files) ? files : [files],
        );
      },
      [
        accepts,
        committedLockRef,
        node,
        onFileAttachRef,
        overrideOnFileAttachRef,
        attachedFilesMap,
        ref,
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
      const reset = readFieldNodeInteractionEpoch(node);
      finishFieldNodeInput(node);
      if (node.state[FieldNodeState.Touched]) return;
      requestId.current = requestAnimationFrame(() => {
        if (
          selection.active &&
          isLive() &&
          reset === readFieldNodeInteractionEpoch(node) &&
          !node.state[FieldNodeState.Touched]
        )
          node.setState(TOUCHED_STATE_PATCH);
      });
    }, [accepts, isLive, node, selection]);
    useOnUnmount(() => {
      // Activity hiding runs this cleanup with the DOM still connected; unmount has removed it.
      if (!attachmentOwner.current.container?.isConnected)
        attachedFilesMap.detach(attachmentOwner.current);
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
        ref={position.ref}
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
          nullable={node.isNullable}
          watchValues={node.watchValues}
          ChildFields={ChildFields}
          context={context}
        />
        {position.detector}
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
