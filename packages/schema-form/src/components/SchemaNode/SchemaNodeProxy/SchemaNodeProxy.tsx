import { Fragment, useContext, useMemo, useRef } from 'react';

import { nullFunction } from '@lumy/schema-form/app/constant';
import { isTruthy } from '@lumy/schema-form/helpers/filter';
import { usePrepareSchemaValues } from '@lumy/schema-form/hooks/usePrepareSchemaValues';
import { useSchemaNodeListener } from '@lumy/schema-form/hooks/useSchemaNodeListener';
import { useSnapshot } from '@lumy/schema-form/hooks/useSnapshot';
import {
  FormTypeRendererContext,
  UserDefinedContext,
} from '@lumy/schema-form/providers';
import { type FormTypeRendererProps, ShowError } from '@lumy/schema-form/types';

import { SchemaNodeAdapter } from '../SchemaNodeAdapter';
import type { GridForm } from '../type';
import type { SchemaNodeProxyProps } from './type';

export const SchemaNodeProxy = ({
  path,
  node: inputNode,
  gridFrom,
  overrideFormTypeInputProps = {},
  FormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
}: SchemaNodeProxyProps) => {
  const { node, show, watchValues } = usePrepareSchemaValues(inputNode ?? path);

  const overrideFormTypeInputPropsRef = useRef(overrideFormTypeInputProps);
  overrideFormTypeInputPropsRef.current = useSnapshot(
    overrideFormTypeInputProps,
  );

  const watchValuesRef = useRef(watchValues);
  watchValuesRef.current = useSnapshot(watchValues);

  const gridFormRef = useRef<GridForm>();
  gridFormRef.current = gridFrom;

  const Input = useMemo<FormTypeRendererProps['Input']>(() => {
    return (overrideProps) =>
      node ? (
        <SchemaNodeAdapter
          node={node}
          watchValues={watchValuesRef.current}
          gridFrom={gridFormRef.current}
          overridePropsFromProxy={overrideFormTypeInputPropsRef.current}
          overridePropsFromInput={overrideProps}
          PreferredFormTypeInput={FormTypeInput}
        />
      ) : (
        <Fragment />
      );
  }, [node, FormTypeInput, overrideFormTypeInputPropsRef, watchValuesRef]);

  const {
    FormTypeRenderer: ContextFormTypeRenderer,
    formatError: contextFormatError,
    checkShowError,
  } = useContext(FormTypeRendererContext);

  const FormTypeRenderer = useMemo(
    () => InputFormTypeRenderer ?? ContextFormTypeRenderer,
    [InputFormTypeRenderer, ContextFormTypeRenderer],
  );

  const Wrapper = useMemo(() => {
    return InputWrapper ?? Fragment;
  }, [InputWrapper]);

  const { context: userDefinedContext } = useContext(UserDefinedContext);

  const { [ShowError.Dirty]: dirty, [ShowError.Touched]: touched } =
    node?.state || {};
  const errors = node?.errors;

  const formatError = useMemo(() => {
    if (checkShowError({ dirty, touched }) === false) {
      return nullFunction;
    }
    return contextFormatError;
  }, [checkShowError, contextFormatError, dirty, touched]);

  const errorMessage = useMemo(() => {
    return errors?.map((error) => formatError(error)).filter(isTruthy)[0];
  }, [errors, formatError]);

  const [tick, formElementRef] = useSchemaNodeListener(node);

  return node && show ? (
    <Wrapper key={tick}>
      <span ref={formElementRef}>
        <FormTypeRenderer
          node={node}
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
  ) : null;
};
