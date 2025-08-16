import { Fragment, memo, useMemo } from 'react';

import { nullFunction } from '@winglet/common-utils/constant';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { useConstant } from '@winglet/react-utils/hook';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import type { FormTypeRendererProps } from '@/schema-form/types';

import { SchemaNodeInputWrapper } from '../SchemaNodeInput';
import type { SchemaNodeProxyProps } from './type';

const RERENDERING_EVENT =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateState |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;

export const SchemaNodeProxy = memo(
  ({
    path,
    node: inputNode,
    overrideProps,
    FormTypeInput,
    FormTypeRenderer: InputFormTypeRenderer,
    Wrapper: InputWrapper,
  }: SchemaNodeProxyProps) => {
    const node = useSchemaNode(inputNode || path);
    const refresh = useSchemaNodeTracker(node, RERENDERING_EVENT);

    const Input = useMemo<FormTypeRendererProps['Input']>(
      () =>
        SchemaNodeInputWrapper(
          node,
          overrideProps,
          FormTypeInput,
          SchemaNodeProxy,
        ),
      [node, overrideProps, FormTypeInput],
    );

    const {
      FormTypeRenderer: ContextFormTypeRenderer,
      formatError: contextFormatError,
      checkShowError,
    } = useFormTypeRendererContext();

    const FormTypeRenderer = useConstant(
      withErrorBoundary(InputFormTypeRenderer || ContextFormTypeRenderer),
    );

    const Wrapper = useConstant(InputWrapper || Fragment);

    const { context } = useWorkspaceContext();

    const formatError = useMemo(() => {
      const state = node?.state || {};
      if (
        checkShowError({
          dirty: state[NodeState.Dirty],
          touched: state[NodeState.Touched],
          showError: state[NodeState.ShowError],
        })
      )
        return contextFormatError;
      else return nullFunction;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node, refresh, checkShowError, contextFormatError]);

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

    const version = useSchemaNodeTracker(node, NodeEventType.RequestRefresh);

    if (!node?.visible) return null;

    return (
      <Wrapper key={version}>
        <span data-json-path={node.path}>
          <FormTypeRenderer
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
            errorMessage={errorMessage}
            formatError={formatError}
            context={context}
            {...node.jsonSchema.FormTypeRendererProps}
            {...overrideProps}
          />
        </span>
      </Wrapper>
    );
  },
);
