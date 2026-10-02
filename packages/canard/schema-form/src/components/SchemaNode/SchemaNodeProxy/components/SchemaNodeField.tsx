import { type ComponentType, Fragment, memo, useMemo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { useConstant, useLazyConstant } from '@winglet/react-utils/hook';

import { DISPLAY_CONTENT, NONE_ROLE } from '@/schema-form/app/constants';
import { SchemaNodeEventType } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FormTypeRendererProps, JSONSchema } from '@/schema-form/types';

import { SchemaNodeInputWrapper } from '../../SchemaNodeInput';
import type { SchemaNodeProxyProps } from '../type';

const RERENDERING_EVENT =
  SchemaNodeEventType.UpdateValue |
  SchemaNodeEventType.UpdateState |
  SchemaNodeEventType.UpdateError |
  SchemaNodeEventType.UpdateComputedProperties |
  SchemaNodeEventType.UpdateJsonSchema |
  SchemaNodeEventType.UpdatePath;

/** Render one resolved field inside its owning error boundary. */
export const SchemaNodeField = ({
  NodeProxy,
  node: inputNode,
  onChangeRef,
  onFileAttachRef,
  overridePropsRef,
  FormTypeInput,
  FormTypeGroupRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
}: SchemaNodeProxyProps & {
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}) => {
  const node = inputNode ?? null;
  const refresh = useSchemaNodeTracker(node, RERENDERING_EVENT);

  const Input = useMemo<FormTypeRendererProps['Input']>(
    () =>
      SchemaNodeInputWrapper(
        node,
        onChangeRef,
        onFileAttachRef,
        overridePropsRef,
        FormTypeInput,
        NodeProxy,
      ),
    [
      node,
      onChangeRef,
      onFileAttachRef,
      overridePropsRef,
      FormTypeInput,
      NodeProxy,
    ],
  );

  const {
    FormTypeGroupRenderer: ContextFormTypeRenderer,
    formatError: contextFormatError,
    checkShowError,
  } = useFormTypeRendererContext();

  const FormTypeGroupRenderer = useLazyConstant(() =>
    memo(
      withErrorBoundary(
        InputFormTypeRenderer || ContextFormTypeRenderer,
        undefined,
        useBoundaryReporter,
      ),
    ),
  );

  const Wrapper = useConstant(InputWrapper || Fragment);

  const { context } = useWorkspaceContext();

  const errorVisible = checkShowError(node?.state);

  const formatError = useMemo(() => {
    if (errorVisible) return contextFormatError;
    else return NULL_FUNCTION;
  }, [errorVisible, contextFormatError]);

  const errorMessage = useMemo(() => {
    const errors = node?.errors;
    if (!errors) return null;
    for (let i = 0, length = errors.length; i < length; i++) {
      const message = formatError(errors[i], node, context);
      if (message !== null) return message;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, refresh, context, formatError]);

  const version = useSchemaNodeTracker(
    node,
    SchemaNodeEventType.RequestRemount,
  );

  if (!node?.enabled) return null;

  return (
    <Wrapper key={version}>
      <div data-path={node.path} role={NONE_ROLE} style={DISPLAY_CONTENT}>
        <FormTypeGroupRenderer
          {...(node.jsonSchema as JSONSchema).presentation
            ?.FormTypeRendererProps}
          {...overridePropsRef?.current}
          // Non-overridable: Essential node system properties
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
          errorMessage={errorMessage}
          formatError={formatError}
          context={context}
        />
      </div>
    </Wrapper>
  );
};
