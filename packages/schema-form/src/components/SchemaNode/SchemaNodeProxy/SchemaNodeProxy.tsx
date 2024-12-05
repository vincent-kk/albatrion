import { Fragment, useMemo, useRef } from 'react';

import { isTruthy, nullFunction } from '@lumy-pack/common';
import { useReference } from '@lumy-pack/common-react';

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
  overridableFormTypeInputProps,
  FormTypeInput: PreferredFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
}: SchemaNodeProxyProps) => {
  const { node, visible, disabled, readOnly, watchValues } =
    usePrepareSchemaValues(inputNode || path);

  const propsPackage = useReference({
    gridFrom,
    disabled,
    readOnly,
    watchValues,
    PreferredFormTypeInput,
    overridableFormTypeInputProps,
  });

  const Input = useMemo<FormTypeRendererProps['Input']>(() => {
    return (overridableProps) =>
      node ? (
        <SchemaNodeAdapter
          node={node}
          gridFrom={propsPackage.current.gridFrom}
          disabled={propsPackage.current.disabled}
          readOnly={propsPackage.current.readOnly}
          watchValues={propsPackage.current.watchValues}
          overridablePropsFromInput={overridableProps}
          overridablePropsFromProxy={
            propsPackage.current.overridableFormTypeInputProps
          }
          PreferredFormTypeInput={propsPackage.current.PreferredFormTypeInput}
          NodeProxy={SchemaNodeProxy}
        />
      ) : (
        <Fragment />
      );
  }, [node, propsPackage]);

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

  const renderCount = useRef(0);
  renderCount.current += 1;

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
        <div>{'Renderer: ' + renderCount.current}</div>
      </span>
    </Wrapper>
  );
};
