import { memo, useCallback, useContext, useMemo, useRef } from 'react';

import { useConstant } from '@lumy/schema-form/hooks/useConstant';
import { useFormTypeInput } from '@lumy/schema-form/hooks/useFormTypeInput';
import { useOnUnmount } from '@lumy/schema-form/hooks/useOnUnmount';
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
        if (node.jsonSchema.readOnly || node.jsonSchema.disabled) return;
        node.setValue(input, options);
        node.clearReceivedErrors();
        node.setState({ [ShowError.Dirty]: true });
      },
      [node],
    );

    const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();
    const clearFeedbackTimer = useCallback(() => {
      if (!feedbackTimer.current) return;
      clearTimeout(feedbackTimer.current);
    }, []);
    const setFeedbackTimer = useCallback(() => {
      feedbackTimer.current = setTimeout(() => {
        node.setState({ [ShowError.Touched]: true });
      });
    }, [node]);

    // NOTE: clearFeedbackTimer is called when the component unmounts
    useOnUnmount(clearFeedbackTimer);

    const { context: userDefinedContext } = useContext(UserDefinedContext);

    if (!node || !FormTypeInput) return null;

    return (
      <span
        className={styles.frame}
        onFocus={clearFeedbackTimer}
        onBlur={setFeedbackTimer}
      >
        <FormTypeInput
          jsonSchema={node.jsonSchema}
          readOnly={!!node.jsonSchema.readOnly}
          disabled={!!node.jsonSchema.disabled}
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
    );
  },
);
