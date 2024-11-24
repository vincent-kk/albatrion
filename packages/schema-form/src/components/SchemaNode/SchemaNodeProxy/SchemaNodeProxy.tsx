import { Fragment, useContext, useMemo, useRef } from 'react';

import { nullFunction } from '@lumy/schema-form/app/constant';
import { FallbackSchemaNodeRenderer } from '@lumy/schema-form/components/FallbackComponents/FallbackSchemaNodeRenderer';
import { isTruthy } from '@lumy/schema-form/helpers/filter';
import { usePrepareSchemaValues } from '@lumy/schema-form/hooks/usePrepareSchemaValues';
import { useSchemaNodeListener } from '@lumy/schema-form/hooks/useSchemaNodeListener';
import { useSnapshot } from '@lumy/schema-form/hooks/useSnapshot';
import {
  SchemaNodeRendererContext,
  UserDefinedContext,
} from '@lumy/schema-form/providers';
import {
  type SchemaNodeRendererProps,
  ShowError,
} from '@lumy/schema-form/types';

import { SchemaNodeAdapter } from '../SchemaNodeAdapter';
import type { GridForm } from '../type';
import type { SchemaNodeProxyProps } from './type';

export const SchemaNodeProxy = ({
  path,
  node: inputNode,
  gridFrom,
  overrideFormTypeInputProps = {},
  FormTypeInput,
  SchemaNodeRenderer: InputSchemaNodeRenderer,
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

  const Input = useMemo<SchemaNodeRendererProps['Input']>(() => {
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
    SchemaNodeRenderer: ContextSchemaNodeRenderer,
    formatError: contextFormatError,
    checkShowError,
  } = useContext(SchemaNodeRendererContext);

  const SchemaNodeRenderer = useMemo(
    () =>
      InputSchemaNodeRenderer ??
      ContextSchemaNodeRenderer ??
      FallbackSchemaNodeRenderer,
    [InputSchemaNodeRenderer, ContextSchemaNodeRenderer],
  );

  const Wrapper = useMemo(() => {
    return InputWrapper ?? Fragment;
  }, [InputWrapper]);

  const { context: userDefinedContext } = useContext(UserDefinedContext);

  const formatError = useMemo(() => {
    const { [ShowError.Dirty]: dirty, [ShowError.Touched]: touched } =
      node?.state || {};
    if (checkShowError({ dirty, touched }) === false) {
      return nullFunction;
    }
    return contextFormatError;
  }, [checkShowError, contextFormatError, node]);

  const errorMessage = useMemo(() => {
    return node?.errors?.map((error) => formatError(error)).filter(isTruthy)[0];
  }, [node, formatError]);

  const [tick, formElementRef] = useSchemaNodeListener(node);

  return node && show ? (
    <Wrapper key={tick}>
      <span ref={formElementRef}>
        <SchemaNodeRenderer
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
