import { memo, useCallback, useMemo, useRef } from 'react';

import { useConstant } from '@lumy-pack/common-react';

import { useFormTypeInput } from '@lumy/schema-form/hooks/useFormTypeInput';
import { useUserDefinedContext } from '@lumy/schema-form/providers';
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
    const handleFocus = useCallback(() => {
      if (!feedbackTimer.current) return;
      clearTimeout(feedbackTimer.current);
    }, []);
    const handleBlur = useCallback(() => {
      feedbackTimer.current = setTimeout(() => {
        node.setState({ [ShowError.Touched]: true });
      });
    }, [node]);

    const { context: userDefinedContext } = useUserDefinedContext();

    if (!node || !FormTypeInput) return null;

    return (
      <span className={styles.frame} onFocus={handleFocus} onBlur={handleBlur}>
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
