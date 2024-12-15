import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isFunction, isString } from '@lumy-pack/common';
import {
  isFunctionComponent,
  isReactElement,
  useHandle,
  useMemorize,
} from '@lumy-pack/common-react';

import { useModalContext } from '@/promise-modal/providers';
import type {
  ManagedEntity,
  ModalHandlers,
  PromptModal,
} from '@/promise-modal/types';

interface PromptInnerProps<T, B> {
  modal: PromptModal<T, B> & ManagedEntity;
  handlers: Pick<ModalHandlers, 'onChange' | 'onClose' | 'onConfirm'>;
}

export const PromptInner = memo(
  <T, B>({ modal, handlers }: PromptInnerProps<T, B>) => {
    const {
      Input,
      value: defaultValue,
      disabled: checkDisabled,
      immediate,
      title,
      subtitle,
      content,
      footer,
    } = useMemo(() => modal, [modal]);

    const InputComponent = useMemorize(Input);

    const [value, setValue] = useState<T | null>(defaultValue);

    const { onChange, onClose, onConfirm } = useMemo(
      () => handlers,
      [handlers],
    );

    const handleClose = useHandle(onClose);
    const handleChange = useHandle(
      (inputValue: T | null | ((prevState: T | null) => T | null)) => {
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

    useEffect(() => {
      if (!value || checkDisabled?.(value)) return;
      if (immediate) {
        onConfirm();
      }
    }, [value]);

    const disabled = useMemo(
      () => checkDisabled?.(value) || false,
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

        {InputComponent && (
          <InputComponent
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onConfirm={handleConfirm}
          />
        )}

        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
              onCancel: handleClose,
              onChange: handleChange,
              value,
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
