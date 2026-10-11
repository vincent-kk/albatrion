import { Fragment, memo, useMemo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { isMemoComponent } from '@winglet/react-utils/filter';
import { ErrorBoundary } from '@winglet/react-utils/hoc';
import { useConstant, useLazyConstant, useReference } from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/app/constants';
import { SchemaNodeEventType } from '@/schema-form/core';
import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FormTypeRendererProps, JSONSchema } from '@/schema-form/types';

import { SchemaNodeInputWrapper } from '../SchemaNodeInput';
import type { SchemaNodeProxyProps } from './type';

const RERENDERING_EVENT =
  SchemaNodeEventType.UpdateValue |
  SchemaNodeEventType.UpdateState |
  SchemaNodeEventType.UpdateError |
  SchemaNodeEventType.UpdateComputedProperties |
  SchemaNodeEventType.UpdateJsonSchema |
  SchemaNodeEventType.UpdatePath;

/** Resolve one node, track its revisions and isolate its injected rendering surfaces. */
export const SchemaNodeProxy = ({
  path,
  node: inputNode,
  onChangeRef,
  onFileAttachRef,
  overridePropsRef,
  FormTypeInput,
  FormTypeGroupRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
}: SchemaNodeProxyProps) => {
  const node = useSchemaNode(inputNode || path);
  const refresh = useSchemaNodeTracker(node, RERENDERING_EVENT);
  const refreshRef = useReference(refresh);
  const onError = useBoundaryReporter(node?.path);

  const Input = useMemo<FormTypeRendererProps['Input']>(
    () => SchemaNodeInputWrapper(
      node, onChangeRef, onFileAttachRef, overridePropsRef, FormTypeInput, SchemaNodeProxy,
    ),
    [node, onChangeRef, onFileAttachRef, overridePropsRef, FormTypeInput],
  );

  const {
    FormTypeGroupRenderer: ContextFormTypeRenderer,
    formatError: contextFormatError,
    checkShowError,
  } = useFormTypeRendererContext();

  const FormTypeGroupRenderer = useLazyConstant(() => {
    const Component = InputFormTypeRenderer || ContextFormTypeRenderer;
    const Renderer = isMemoComponent(Component) ? Component : memo(Component);
    /** Compute the message below the owning boundary without leaking extra props to the renderer. */
    return function RendererWithErrorMessage(props: Omit<FormTypeRendererProps, 'errorMessage'>) {
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
  const version = useSchemaNodeTracker(node, SchemaNodeEventType.RequestRemount);

  if (!node?.enabled) return null;

  return (
    <Wrapper key={version}>
      <div data-path={node.path} role={NONE_ROLE} style={DISPLAY_CONTENT}>
        <ErrorBoundary onError={onError}>
          <FormTypeGroupRenderer
            {...(node.jsonSchema as JSONSchema).presentation?.FormTypeRendererProps}
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
