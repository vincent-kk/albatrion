import { Fragment, memo, useCallback, useMemo, useState } from 'react';

import { isFunction, isString } from '@winglet/common-utils';
import {
  renderComponent,
  useHandle,
  withErrorBoundary,
} from '@winglet/react-utils';

import type { PromptNode } from '@/promise-modal/core';
import { useModalContext } from '@/promise-modal/providers';
import { useUserDefinedContext } from '@/promise-modal/providers/UserDefinedContext';
import type { ModalActions } from '@/promise-modal/types';

interface PromptInnerProps<T, B> {
  modal: PromptNode<T, B>;
  handlers: Pick<ModalActions, 'onChange' | 'onClose' | 'onConfirm'>;
}

export const PromptInner = memo(
  <T, B>({ modal, handlers }: PromptInnerProps<T, B>) => {
    const {
      Input,
      defaultValue,
      disabled: checkDisabled,
      title,
      subtitle,
      content,
      footer,
    } = useMemo(
      () => ({
        ...modal,
        Input: memo(withErrorBoundary(modal.Input)),
      }),
      [modal],
    );

    const { context: userDefinedContext } = useUserDefinedContext();

    const [value, setValue] = useState<T | undefined>(defaultValue);

    const { onChange, onClose, onConfirm } = useMemo(
      () => handlers,
      [handlers],
    );

    const handleClose = useHandle(onClose);
    const handleChange = useHandle(
      (inputValue?: T | ((prevState: T | undefined) => T | undefined)) => {
        const input = isFunction(inputValue) ? inputValue(value) : inputValue;
        setValue(input);
        onChange(input);
      },
    );

    const handleConfirm = useCallback(() => {
      // NOTE: wait for the next tick to ensure the value is updated
      setTimeout(() => {
        onConfirm();
      });
    }, [onConfirm]);

    const disabled = useMemo(
      () => (value ? !!checkDisabled?.(value) : false),
      [checkDisabled, value],
    );

    const {
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
    } = useModalContext();

    return (
      <Fragment>
        {title &&
          (isString(title) ? (
            <TitleComponent context={userDefinedContext}>
              {title}
            </TitleComponent>
          ) : (
            title
          ))}
        {subtitle &&
          (isString(subtitle) ? (
            <SubtitleComponent context={userDefinedContext}>
              {subtitle}
            </SubtitleComponent>
          ) : (
            subtitle
          ))}
        {content &&
          (isString(content) ? (
            <ContentComponent context={userDefinedContext}>
              {content}
            </ContentComponent>
          ) : (
            renderComponent(content, {
              onConfirm: handleConfirm,
              onCancel: handleClose,
              context: userDefinedContext,
            })
          ))}

        {Input && (
          <Input
            defaultValue={defaultValue}
            value={value}
            onChange={handleChange}
            onConfirm={handleConfirm}
            onCancel={handleClose}
            context={userDefinedContext}
          />
        )}

        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              value,
              disabled,
              onChange: handleChange,
              onConfirm: handleConfirm,
              onCancel: handleClose,
              context: userDefinedContext,
            })
          ) : (
            <FooterComponent
              disabled={disabled}
              onConfirm={handleConfirm}
              onCancel={handleClose}
              confirmLabel={footer?.confirm}
              cancelLabel={footer?.cancel}
              hideConfirm={footer?.hideConfirm}
              hideCancel={footer?.hideCancel}
              context={userDefinedContext}
            />
          ))}
      </Fragment>
    );
  },
);
