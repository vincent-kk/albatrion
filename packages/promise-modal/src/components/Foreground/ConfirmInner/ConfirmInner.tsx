import { match } from 'ts-pattern';

import { isString } from 'es-toolkit';
import { memo, useCallback, useContext, useMemo } from 'react';

import { isComponentType } from '@amata/modal/src/helpers/filter';
import { ModalContext } from '@amata/modal/src/providers/ModalProvider';
import type {
  ConfirmContentProps,
  ConfirmModal,
  ManagedEntity,
  ModalHandlers,
} from '@amata/modal/src/types';

import DefaultFooter from '../../DefaultFooter';
import DefaultSubtitle from '../../DefaultSubtitle';
import DefaultContent from '../../DefaultSubtitle';
import DefaultTitle from '../../DefaultTitle';

function ConfirmInner<B>({
  id,
  title,
  subtitle,
  content,
  footer,
  onConfirm,
  onClose,
}: ConfirmModal<B> &
  ManagedEntity &
  Pick<ModalHandlers, 'onConfirm' | 'onClose'>) {
  const handleConfirm = useCallback(() => onConfirm(id), [id, onConfirm]);
  const handleClose = useCallback(() => () => onClose(id), [id, onClose]);

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
          .when(isComponentType<ConfirmContentProps>, (Content) => (
            <Content onConfirm={handleConfirm} onCancel={handleClose} />
          ))
          .otherwise(() => content)}
      {footer !== false &&
        (typeof footer === 'function' ? (
          footer({
            onConfirm: handleConfirm,
            onCancel: handleClose,
          })
        ) : (
          <FooterFrame
            onConfirm={handleConfirm}
            onCancel={handleClose}
            confirmLabel={footer?.confirm}
            cancelLabel={footer?.cancel}
            hideConfirm={footer?.hideConfirm}
            hideCancel={footer?.hideCancel}
          />
        ))}
    </>
  );
}

const MemoizedConfirmInner = memo(ConfirmInner);

export default MemoizedConfirmInner;
