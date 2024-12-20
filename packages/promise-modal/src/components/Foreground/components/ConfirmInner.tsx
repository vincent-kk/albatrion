import { Fragment, memo, useMemo } from 'react';

import { isString } from '@lumy-pack/common';
import { renderComponent, useHandle } from '@lumy-pack/common-react';

import type { ConfirmNode } from '@/promise-modal/core';
import { useModalContext } from '@/promise-modal/providers';
import type { ModalActions } from '@/promise-modal/types';

interface ConfirmInnerProps<B> {
  modal: ConfirmNode<B>;
  handlers: Pick<ModalActions, 'onConfirm' | 'onClose'>;
}

export const ConfirmInner = memo(
  <B,>({ modal, handlers }: ConfirmInnerProps<B>) => {
    const { title, subtitle, content, footer } = useMemo(() => modal, [modal]);
    const { onConfirm, onClose } = useMemo(() => handlers, [handlers]);

    const handleConfirm = useHandle(onConfirm);
    const handleClose = useHandle(onClose);

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
          ) : (
            renderComponent(content, {
              onConfirm: handleConfirm,
              onCancel: handleClose,
            })
          ))}
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
