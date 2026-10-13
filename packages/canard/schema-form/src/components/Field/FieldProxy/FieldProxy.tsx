import { Fragment, memo, useMemo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent } from '@winglet/react-utils/filter';
import { ErrorBoundary } from '@winglet/react-utils/hoc';
import {
  useConstant,
  useLazyConstant,
  useReference,
} from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/app/constants';
import { FieldNodeEventType } from '@/schema-form/core';
import { useFieldNode } from '@/schema-form/hooks/useFieldNode';
import { useFieldNodeTracker } from '@/schema-form/hooks/useFieldNodeTracker';
import {
  useFieldRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FieldRendererProps, JSONSchema } from '@/schema-form/types';

import { FieldInputSlotWrapper } from '../FieldInputSlot';
import type { FieldProxyProps } from './type';

const RERENDERING_EVENT =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdateError |
  FieldNodeEventType.UpdateComputedProperties |
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
  const errorVisible = checkShowError(node?.state);
  const formatError = errorVisible ? contextFormatError : NULL_FUNCTION;
  const version = useFieldNodeTracker(node, FieldNodeEventType.RequestRemount);

  if (!node?.enabled) return null;

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
      </div>
    </Wrapper>
  );
};
