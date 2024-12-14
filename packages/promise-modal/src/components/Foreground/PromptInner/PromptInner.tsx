import { match } from 'ts-pattern';

import { isString } from 'es-toolkit';
import { memo, useCallback, useContext, useEffect, useMemo } from 'react';

import DefaultFooter from '@amata/modal/src/components/DefaultFooter';
import DefaultSubtitle from '@amata/modal/src/components/DefaultSubtitle';
import { isComponentType } from '@amata/modal/src/helpers/filter';
import { ModalContext } from '@amata/modal/src/providers/ModalProvider';
import type {
  ManagedEntity,
  ModalHandlers,
  PromptContentProps,
  PromptModal,
} from '@amata/modal/src/types';

import DefaultContent from '../../DefaultSubtitle';
import DefaultTitle from '../../DefaultTitle';

function PromptInner<T, B>({
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
  Pick<ModalHandlers, 'onChange' | 'onClose' | 'onConfirm'>) {
  useEffect(() => {
    if (!value || disabled?.(value)) return;
    if (immediate) {
      onConfirm(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const disable = disabled?.(value) || false;

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
  } = useContext(ModalContext);

  const TitleFrame = useMemo(
    () => TitleComponent || DefaultTitle,
    [TitleComponent],
  );

  const SubtitleFrame = useMemo(
    () => SubtitleComponent || DefaultSubtitle,
    [SubtitleComponent],
  );

  const ContentFrame = useMemo(
    () => ContentComponent || DefaultContent,
    [ContentComponent],
  );

  const FooterFrame = useMemo(
    () => FooterComponent || DefaultFooter,
    [FooterComponent],
  );

  return (
    <>
      {title && (isString(title) ? <TitleFrame>{title}</TitleFrame> : title)}
      {subtitle &&
        (isString(subtitle) ? (
          <SubtitleFrame>{subtitle}</SubtitleFrame>
        ) : (
          subtitle
        ))}
      {content &&
        match(content)
          .when(isString, (content) => <ContentFrame>{content}</ContentFrame>)
          .when(isComponentType<PromptContentProps>, (Content) => (
            <Content onConfirm={handleConfirm} onCancel={handleClose} />
          ))
          .otherwise(() => content)}
      {input?.({
        value,
        onChange: handleChange,
        onConfirm: handleConfirm,
      })}

      {footer !== false &&
        (typeof footer === 'function' ? (
          footer({
            onConfirm: handleConfirm,
            onCancel: handleClose,
            value,
            onChange: handleChange,
            disable,
          })
        ) : (
          <FooterFrame
            onConfirm={handleConfirm}
            onCancel={handleClose}
            disable={disable}
            confirmLabel={footer?.confirm}
            cancelLabel={footer?.cancel}
            hideConfirm={footer?.hideConfirm}
            hideCancel={footer?.hideCancel}
          />
        ))}
    </>
  );
}

const MemoizedPromptInner = memo(PromptInner);

export default MemoizedPromptInner;
