import { Fragment, memo, useMemo } from 'react';

import { nullFunction } from '@winglet/common-utils';
import { useMemorize, withErrorBoundary } from '@winglet/react-utils';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import { useSchemaNodeInputControl } from '@/schema-form/hooks/useSchemaNodeInputControl';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { FormTypeRendererProps } from '@/schema-form/types';

import { SchemaNodeAdapterWrapper } from '../SchemaNodeAdapter';
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
        SchemaNodeAdapterWrapper(
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

    const FormTypeRenderer = useMemorize(
      withErrorBoundary(InputFormTypeRenderer || ContextFormTypeRenderer),
    );

    const Wrapper = useMemorize(InputWrapper || Fragment);

    const { context: userDefinedContext } = useUserDefinedContext();

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
      for (const error of errors) {
        const message = formatError(error);
        if (message) return message;
      }
      return null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node, refresh, formatError]);

    const [version, formElementRef] = useSchemaNodeInputControl(node);

    if (!node?.visible) return null;

    return (
      <Wrapper key={version}>
        <span ref={formElementRef} data-json-path={node.path}>
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
            context={userDefinedContext}
            {...overrideProps}
          />
        </span>
      </Wrapper>
    );
  },
);
