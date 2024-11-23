import { memo, useCallback, useContext, useMemo, useRef } from 'react';

import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import { useFormTypeInput } from '@lumy/schema-form/hooks/useFormTypeInput';
import { useSchemaNodeTracker } from '@lumy/schema-form/hooks/useSchemaNodeTracker';
import { UserDefinedContext } from '@lumy/schema-form/providers';
import { ShowError } from '@lumy/schema-form/types';

import type { SchemaNodeInputProps } from './type';

export const SchemaNodeInput = memo(
  ({
    node,
    watchValues,
    overrideFormTypeInputProps,
    PreferredFormTypeInput,
    childNodes,
  }: SchemaNodeInputProps) => {
    const FormTypeInputByNode = useFormTypeInput(node);
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput ?? FormTypeInputByNode,
      [FormTypeInputByNode, PreferredFormTypeInput],
    );

    const defaultValue = useConstant(() => node.defaultValue);

    const handleChange = useCallback<SetStateFn<any>>(
      (input) => {
        if (node?.jsonSchema?.readOnly) return;
        node.setValue(input);
        node.clearReceivedErrors();
        node.setState({ [ShowError.Dirty]: true });
      },
      [node],
    );

    const blurTimer = useRef<ReturnType<typeof setTimeout>>();
    const handleFocus = useCallback(() => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    }, []);
    const handleBlur = useCallback(() => {
      blurTimer.current = setTimeout(() => {
        node.setState({ [ShowError.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useContext(UserDefinedContext);

    useSchemaNodeTracker(node);

    return FormTypeInput ? (
      <span onFocus={handleFocus} onBlur={handleBlur}>
        <FormTypeInput
          jsonSchema={node.jsonSchema}
          readonly={!!node.jsonSchema?.readOnly}
          node={node}
          childNodes={childNodes}
          name={node.name}
          path={node.path}
          errors={node.errors}
          watchValues={watchValues}
          defaultValue={defaultValue}
          value={node.value}
          onChange={handleChange}
          context={userDefinedContext}
          {...overrideFormTypeInputProps}
        />
      </span>
    ) : null;
  },
);
