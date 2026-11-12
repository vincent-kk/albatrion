import { Fragment, memo, useMemo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent } from '@winglet/react-utils/filter';
import {
  useConstant,
  useReference,
  useVersion,
} from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import { FieldNodeEventType } from '@/schema-form/core';
import { useFieldNode } from '@/schema-form/hooks';
import { useFieldNodeTracker } from '@/schema-form/hooks';
import {
  useFieldRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import {
  ErrorRevealSubscriber,
  FIELD_ERROR_TRACKING_EVENTS,
  resolveFieldErrorVisibility,
  selectFieldErrorMessage,
} from '@/schema-form/providers/FieldRendererContext';
import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FieldRendererProps, JSONSchema } from '@/schema-form/types';

import { createFieldInputBridge } from './components/FieldInputBridge';
import type { FieldProxyProps } from './type';
import { createErrorMessagePart } from './utils/createErrorMessagePart';
import { createLabelPart } from './utils/createLabelPart';
import { getRendererBoundary } from './utils/getRendererBoundary';
import { resolveRequired } from './utils/resolveRequired';

/** Resolve one node, track its revisions and isolate its injected rendering surfaces. */
export const FieldProxy = ({
  path: inputPath,
  node: inputNode,
  onChangeRef,
  onFileAttachRef,
  overridePropsRef,
  FieldInput,
  FieldRenderer: InputFieldRenderer,
  Wrapper: InputWrapper,
}: FieldProxyProps) => {
  const node = useFieldNode(inputNode || inputPath);
  const refresh = useFieldNodeTracker(node, FIELD_ERROR_TRACKING_EVENTS);
  const refreshRef = useReference(refresh);
  const onError = useBoundaryReporter(node?.path);

  const Input = useMemo<FieldRendererProps['Input']>(
    () =>
      createFieldInputBridge(
        node,
        onChangeRef,
        onFileAttachRef,
        overridePropsRef,
        FieldInput,
        FieldProxy,
      ),
    [node, onChangeRef, onFileAttachRef, overridePropsRef, FieldInput],
  );

  const {
    FieldRenderer: ContextFieldRenderer,
    LabelRenderer,
    ErrorMessageRenderer,
    InputRenderer,
    formatError: contextFormatError,
    checkErrorVisibility,
    errorVisibility,
  } = useFieldRendererContext();

  const jsonSchema = node?.jsonSchema;
  const presentation = (jsonSchema as JSONSchema | undefined)?.presentation;
  const required = resolveRequired(
    overridePropsRef?.current.required,
    presentation?.required,
    node?.isRequired ?? false,
  );
  const Label = useMemo(
    () => createLabelPart(LabelRenderer, node, required, jsonSchema),
    [LabelRenderer, node, jsonSchema, required],
  );
  const ErrorMessage = useMemo(
    () =>
      createErrorMessagePart(ErrorMessageRenderer, node, required, jsonSchema),
    [ErrorMessageRenderer, node, jsonSchema, required],
  );

  const Component = InputFieldRenderer || ContextFieldRenderer;
  const [FieldRenderer, RendererBoundary] = useMemo(() => {
    const Renderer = isMemoComponent(Component) ? Component : memo(Component);
    /** Compute the message below the owning boundary without leaking extra props to the renderer. */
    function RendererWithErrorMessage(
      props: Omit<FieldRendererProps, 'errorMessage'>,
    ) {
      const { node, context, formatError } = props;
      const errorMessage = useMemo(() => {
        return selectFieldErrorMessage(node, context, formatError);
        // The revision snapshot invalidates formatting for the same live node identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [node, refreshRef.current, context, formatError]);
      return <Renderer {...props} errorMessage={errorMessage} />;
    }
    return [RendererWithErrorMessage, getRendererBoundary(Component)] as const;
  }, [Component, refreshRef]);
  const Wrapper = useConstant(InputWrapper || Fragment);
  const { context } = useWorkspaceContext();
  const [, update] = useVersion();
  const version = useFieldNodeTracker(node, FieldNodeEventType.RequestRemount);

  if (!node?.isPresent) return null;
  const visibility = resolveFieldErrorVisibility(
    node,
    checkErrorVisibility,
    errorVisibility,
  );
  const errorVisible = visibility === true;
  const revealVersion = typeof visibility === 'number' ? visibility : undefined;
  const formatError = errorVisible ? contextFormatError : NULL_FUNCTION;

  return (
    <Wrapper key={version}>
      <div data-path={node.path} role={NONE_ROLE} style={DISPLAY_CONTENT}>
        <RendererBoundary
          onError={onError}
          formatError={contextFormatError}
          LabelRenderer={LabelRenderer}
          ErrorMessageRenderer={ErrorMessageRenderer}
          InputRenderer={InputRenderer}
        >
          <FieldRenderer
            {...presentation?.FieldRendererProps}
            {...overridePropsRef?.current}
            // Essential node properties are owned by the binding.
            node={node}
            type={node.type}
            jsonSchema={node.jsonSchema}
            isRoot={node.isRoot}
            depth={node.depth}
            path={node.path}
            name={node.name}
            value={node.value}
            errors={node.errors}
            required={required}
            Input={Input}
            Label={Label}
            ErrorMessage={ErrorMessage}
            errorVisible={errorVisible}
            formatError={formatError}
            context={context}
          />
        </RendererBoundary>
        {revealVersion !== undefined && (
          <ErrorRevealSubscriber
            node={node}
            version={revealVersion}
            onRelease={update}
          />
        )}
      </div>
    </Wrapper>
  );
};
