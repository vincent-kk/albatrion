import { Fragment, useMemo } from 'react';

import { isTruthy, nullFunction } from '@lumy-pack/common';
import { useReference, useSnapshotReference } from '@lumy-pack/common-react';

import { usePrepareSchemaValues } from '@lumy/schema-form/hooks/usePrepareSchemaValues';
import { useSchemaNodeListener } from '@lumy/schema-form/hooks/useSchemaNodeListener';
import {
  useFormTypeRendererContext,
  useUserDefinedContext,
} from '@lumy/schema-form/providers';
import { type FormTypeRendererProps, ShowError } from '@lumy/schema-form/types';

import { SchemaNodeAdapter } from '../SchemaNodeAdapter';
import type { SchemaNodeProxyProps } from './type';

export const SchemaNodeProxy = ({
  path,
  node: inputNode,
  gridFrom,
  overridableFormTypeInputProps = {},
  FormTypeInput: PreferredFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
}: SchemaNodeProxyProps) => {
  const { node, visible, disabled, readOnly, watchValues } =
    usePrepareSchemaValues(inputNode || path);

  const computedPropsRef = useReference({
    disabled,
    readOnly,
    watchValues,
  });

  const inputPropsRef = useSnapshotReference({
    gridFrom,
    PreferredFormTypeInput,
    overridableFormTypeInputProps,
  });

  const Input = useMemo<FormTypeRendererProps['Input']>(() => {
    return (overrideProps) =>
      node ? (
        <SchemaNodeAdapter
          node={node}
          disabled={computedPropsRef.current.disabled}
          readOnly={computedPropsRef.current.readOnly}
          watchValues={computedPropsRef.current.watchValues}
          overridePropsFromInput={overrideProps}
          overridePropsFromProxy={
            inputPropsRef.current.overridableFormTypeInputProps
          }
          PreferredFormTypeInput={inputPropsRef.current.PreferredFormTypeInput}
          gridFrom={inputPropsRef.current.gridFrom}
          NodeProxy={SchemaNodeProxy}
        />
      ) : (
        <Fragment />
      );
  }, [node, inputPropsRef, computedPropsRef]);

  const {
    FormTypeRenderer: ContextFormTypeRenderer,
    formatError: contextFormatError,
    checkShowError,
  } = useFormTypeRendererContext();

  const InputFormTypeRendererRef = useReference(InputFormTypeRenderer);
  const FormTypeRenderer = useMemo(
    () => InputFormTypeRendererRef.current || ContextFormTypeRenderer,
    [InputFormTypeRendererRef, ContextFormTypeRenderer],
  );

  const Wrapper = useMemo(() => {
    return InputWrapper || Fragment;
  }, [InputWrapper]);

  const { context: userDefinedContext } = useUserDefinedContext();

  const { [ShowError.Dirty]: dirty, [ShowError.Touched]: touched } =
    node?.state || {};
  const errors = node?.errors;

  const formatError = useMemo(() => {
    if (checkShowError({ dirty, touched }) === false) return nullFunction;
    else return contextFormatError;
  }, [checkShowError, contextFormatError, dirty, touched]);

  const errorMessage = useMemo(() => {
    return errors?.map((error) => formatError(error)).filter(isTruthy)[0];
  }, [errors, formatError]);

  const [tick, formElementRef] = useSchemaNodeListener(node);

  // NOTE: node 이거나 visible 이 false 라면 렌더링 하지 않는다.
  if (!node || !visible) return null;

  return (
    <Wrapper key={tick}>
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
};
