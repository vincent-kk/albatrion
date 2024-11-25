import { memo, useCallback, useContext, useMemo, useRef } from 'react';

import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import { useFormTypeInput } from '@lumy/schema-form/hooks/useFormTypeInput';
import { UserDefinedContext } from '@lumy/schema-form/providers';
import { type SetStateFnWithOptions, ShowError } from '@lumy/schema-form/types';

import styles from './styles.module.css';
import type { SchemaNodeAdapterInputProps } from './type';

export const SchemaNodeAdapterInput = memo(
  ({
    node,
    watchValues,
    overrideFormTypeInputProps,
    PreferredFormTypeInput,
    childNodes,
  }: SchemaNodeAdapterInputProps) => {
    const FormTypeInputByNode = useFormTypeInput(node);
    const FormTypeInput = useMemo(
      () => PreferredFormTypeInput ?? FormTypeInputByNode,
      [FormTypeInputByNode, PreferredFormTypeInput],
    );

    const defaultValue = useConstant(() => node.defaultValue);

    const handleChange = useCallback<SetStateFnWithOptions<any>>(
      (input, options) => {
        if (node?.jsonSchema?.readOnly) return;
        node.setValue(input, options);
        node.clearReceivedErrors();
        node.setState({ [ShowError.Dirty]: true });
      },
      [node],
    );

    const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();
    const handleFocus = useCallback(() => {
      if (!feedbackTimer.current) return;
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = undefined;
    }, []);
    const handleBlur = useCallback(() => {
      feedbackTimer.current = setTimeout(() => {
        node.setState({ [ShowError.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useContext(UserDefinedContext);

    return FormTypeInput ? (
      <span className={styles.frame} onFocus={handleFocus} onBlur={handleBlur}>
        <FormTypeInput
          jsonSchema={node.jsonSchema}
          readOnly={!!node.jsonSchema?.readOnly}
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
