import { Fragment, memo, useCallback, useEffect, useMemo } from 'react';

import { isString } from '@lumy-pack/common';
import {
  isFunctionComponent,
  isReactElement,
  useMemorize,
} from '@lumy-pack/common-react';

import { useModalContext } from '@/promise-modal/providers';
import type {
  ManagedEntity,
  ModalHandlers,
  PromptModal,
} from '@/promise-modal/types';

export const PromptInner = memo(
  <T, B>({
    id,
    input,
    value,
    disabled,
    immediate,
    title,
    subtitle,
    content,
    footer,
    onConfirm,
    onClose,
    onChange,
  }: PromptModal<T, B> &
    ManagedEntity &
    Pick<ModalHandlers, 'onChange' | 'onClose' | 'onConfirm'>) => {
    useEffect(() => {
      if (!value || disabled?.(value)) return;
      if (immediate) {
        onConfirm(id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const Input = useMemorize(input);

    const disable = useMemo(
      () => disabled?.(value) || false,
      [disabled, value],
    );

    const handleChange = useCallback(
      (value: any) => onChange(id, value),
      [id, onChange],
    );

    const handleConfirm = useCallback(() => {
      // NOTE: wait for the next tick to ensure the value is updated
      setTimeout(() => {
        onConfirm(id);
      });
    }, [id, onConfirm]);

    const handleClose = useCallback(() => onClose(id), [id, onClose]);

    const {
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
    } = useModalContext();

    return (
      <Fragment>
        {title &&
          (isString(title) ? <TitleComponent>{title}</TitleComponent> : title)}
        {subtitle &&
          (isString(subtitle) ? (
            <SubtitleComponent>{subtitle}</SubtitleComponent>
          ) : (
            subtitle
          ))}
        {content &&
          (isString(content) ? (
            <ContentComponent>{content}</ContentComponent>
          ) : isFunctionComponent(content) ? (
            content({
              onConfirm: handleConfirm,
              onCancel: handleClose,
            })
          ) : isReactElement(content) ? (
            content
          ) : null)}

        {Input && (
          <Input
            value={value}
            onChange={handleChange}
            onConfirm={handleConfirm}
          />
        )}

        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
              onCancel: handleClose,
              value,
              onChange: handleChange,
              disabled,
            })
          ) : (
            <FooterComponent
              onConfirm={handleConfirm}
              onCancel={handleClose}
              disabled={disabled}
              confirmLabel={footer?.confirm}
              cancelLabel={footer?.cancel}
              hideConfirm={footer?.hideConfirm}
              hideCancel={footer?.hideCancel}
            />
          ))}
      </Fragment>
    );
  },
);
