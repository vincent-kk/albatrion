import { Fragment, memo, useMemo, useReducer } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent } from '@winglet/react-utils/filter';
import { ErrorBoundary } from '@winglet/react-utils/hoc';
import {
  useConstant,
  useLazyConstant,
  useReference,
} from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/constants/style';
import {
  FieldNodeEventType,
  readFieldNodeRevealVersion,
} from '@/schema-form/core';
import { useFieldNode } from '@/schema-form/hooks';
import { useFieldNodeTracker } from '@/schema-form/hooks';
import {
  useFieldRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import {
  ErrorRevealSubscriber,
  isErrorRevealed,
} from '@/schema-form/providers/FieldRendererContext';
import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FieldRendererProps, JSONSchema } from '@/schema-form/types';

import { FieldInputSlotWrapper } from './components/FieldInputSlot';
import type { FieldProxyProps } from './type';

/** Advance a held display without allocating a reducer per render.
 * @param value - Previous render sequence.
 * @returns Next render sequence. */
const increment = (value: number) => value + 1;

const RERENDERING_EVENT =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdateError |
  FieldNodeEventType.UpdateControlledProperties |
  FieldNodeEventType.UpdateJsonSchema |
  FieldNodeEventType.UpdatePath;

/** Resolve one node, track its revisions and isolate its injected rendering surfaces. */
export const FieldProxy = ({
  path,
  node: inputNode,
  onChangeRef,
  onFileAttachRef,
  overridePropsRef,
  FieldInput,
  FieldRenderer: InputFieldRenderer,
  Wrapper: InputWrapper,
}: FieldProxyProps) => {
  const node = useFieldNode(inputNode || path);
  const refresh = useFieldNodeTracker(node, RERENDERING_EVENT);
  const refreshRef = useReference(refresh);
  const onError = useBoundaryReporter(node?.path);

  const Input = useMemo<FieldRendererProps['Input']>(
    () =>
      FieldInputSlotWrapper(
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
    formatError: contextFormatError,
    checkShowError,
    showError,
  } = useFieldRendererContext();

  const FieldRenderer = useLazyConstant(() => {
    const Component = InputFieldRenderer || ContextFieldRenderer;
    const Renderer = isMemoComponent(Component) ? Component : memo(Component);
    /** Compute the message below the owning boundary without leaking extra props to the renderer. */
    return function RendererWithErrorMessage(
      props: Omit<FieldRendererProps, 'errorMessage'>,
    ) {
      const { node, context, formatError } = props;
      const errorMessage = useMemo(() => {
        const errors = node.errors;
        if (!errors) return null;
        for (let index = 0; index < errors.length; index++) {
          const message = formatError(errors[index], node, context);
          if (message !== null) return message;
        }
        return null;
        // The revision snapshot invalidates formatting for the same live node identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [node, refreshRef.current, context, formatError]);
      return <Renderer {...props} errorMessage={errorMessage} />;
    };
  });
  const Wrapper = useConstant(InputWrapper || Fragment);
  const { context } = useWorkspaceContext();
  const [, rerender] = useReducer(increment, 0);
  const version = useFieldNodeTracker(node, FieldNodeEventType.RequestRemount);

  if (!node?.enabled) return null;
  const live = checkShowError(node.state);
  const errorVisible = live && isErrorRevealed(node, showError, true);
  const revealVersion =
    live && !errorVisible ? readFieldNodeRevealVersion(node) : undefined;
  const formatError = errorVisible ? contextFormatError : NULL_FUNCTION;

  return (
    <Wrapper key={version}>
      <div data-path={node.path} role={NONE_ROLE} style={DISPLAY_CONTENT}>
        <ErrorBoundary onError={onError}>
          <FieldRenderer
            {...(node.jsonSchema as JSONSchema).presentation
              ?.FieldRendererProps}
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
            required={node.required}
            Input={Input}
            errorVisible={errorVisible}
            formatError={formatError}
            context={context}
          />
        </ErrorBoundary>
        {revealVersion !== undefined && (
          <ErrorRevealSubscriber
            node={node}
            version={revealVersion}
            onRelease={rerender}
          />
        )}
      </div>
    </Wrapper>
  );
};
