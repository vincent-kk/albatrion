import { Fragment, memo, useMemo } from 'react';

import { nullFunction } from '@winglet/common-utils';
import { useReference, withErrorBoundary } from '@winglet/react-utils';

import { NodeEventType, NodeState } from '@/schema-form/core';
import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import { useSchemaNodeListener } from '@/schema-form/hooks/useSchemaNodeListener';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import {
  useFormTypeRendererContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { FormTypeRendererProps } from '@/schema-form/types';

import { SchemaNodeAdapterWrapper } from '../SchemaNodeAdapter';
import type { SchemaNodeProxyProps } from './type';

const RERENDERING_EVENT =
  NodeEventType.Redraw |
  NodeEventType.UpdateValue |
  NodeEventType.UpdateState |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;

export const SchemaNodeProxy = memo(
  ({
    path,
    node: inputNode,
    overridableFormTypeInputProps,
    FormTypeInput: PreferredFormTypeInput,
    FormTypeRenderer: InputFormTypeRenderer,
    Wrapper: InputWrapper,
  }: SchemaNodeProxyProps) => {
    const node = useSchemaNode(inputNode || path);

    const inputPropsRef = useReference({
      PreferredFormTypeInput,
      overridableProps: overridableFormTypeInputProps,
    });

    const Input = useMemo<FormTypeRendererProps['Input']>(() => {
      return SchemaNodeAdapterWrapper(node, inputPropsRef, SchemaNodeProxy);
    }, [node, inputPropsRef]);

    const {
      FormTypeRenderer: ContextFormTypeRenderer,
      formatError: contextFormatError,
      checkShowError,
    } = useFormTypeRendererContext();

    const InputFormTypeRendererRef = useReference(InputFormTypeRenderer);
    const FormTypeRenderer = useMemo(
      () =>
        withErrorBoundary(
          InputFormTypeRendererRef.current || ContextFormTypeRenderer,
        ),
      [InputFormTypeRendererRef, ContextFormTypeRenderer],
    );

    const Wrapper = useMemo(() => {
      return InputWrapper || Fragment;
    }, [InputWrapper]);

    const { context: userDefinedContext } = useUserDefinedContext();

    const {
      [NodeState.Dirty]: dirty,
      [NodeState.Touched]: touched,
      [NodeState.ShowError]: showError,
    } = node?.state || {};
    const errors = node?.errors;

    const formatError = useMemo(() => {
      if (checkShowError({ dirty, touched, showError }) === false)
        return nullFunction;
      else return contextFormatError;
    }, [dirty, touched, showError, checkShowError, contextFormatError]);

    const errorMessage = useMemo(() => {
      if (!errors) return null;
      for (const error of errors) {
        const message = formatError(error);
        if (message) return message;
      }
      return null;
    }, [errors, formatError]);

    useSchemaNodeTracker(node, RERENDERING_EVENT);

    const [version, formElementRef] = useSchemaNodeListener(node);

    if (!node?.visible) return null;

    return (
      <Wrapper key={version}>
        <span ref={formElementRef} data-json-path={node.path}>
          <FormTypeRenderer
            node={node}
            type={node.type}
            jsonSchema={node.jsonSchema}
            isRoot={node.isRoot}
            isArrayItem={node.isArrayItem}
            depth={node.depth}
            path={node.path}
            name={node.name}
            value={node.value}
            errors={node.errors}
            Input={Input}
            errorMessage={errorMessage}
            formatError={formatError}
            context={userDefinedContext}
          />
        </span>
      </Wrapper>
    );
  },
);
