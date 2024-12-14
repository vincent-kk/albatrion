import { Fragment, memo, useCallback } from 'react';

import { isString } from '@lumy-pack/common';
import { isFunctionComponent, isReactElement } from '@lumy-pack/common-react';

import { useModalContext } from '@/promise-modal/providers';
import type {
  ConfirmModal,
  ManagedEntity,
  ModalHandlers,
} from '@/promise-modal/types';

export const ConfirmInner = memo(
  <B,>({
    id,
    title,
    subtitle,
    content,
    footer,
    onConfirm,
    onClose,
  }: ConfirmModal<B> &
    ManagedEntity &
    Pick<ModalHandlers, 'onConfirm' | 'onClose'>) => {
    const handleConfirm = useCallback(() => onConfirm(id), [id, onConfirm]);
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
        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
              onCancel: handleClose,
            })
          ) : (
            <FooterComponent
              onConfirm={handleConfirm}
              onCancel={handleClose}
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
