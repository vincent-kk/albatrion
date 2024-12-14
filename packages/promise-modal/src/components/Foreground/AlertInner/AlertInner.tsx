import { Fragment, memo, useCallback } from 'react';

import { isString } from '@lumy-pack/common';
import { isFunctionComponent, isReactElement } from '@lumy-pack/common-react';

import { useModalContext } from '@/promise-modal/providers/ModalContextProvider';
import type {
  AlertModal,
  ManagedEntity,
  ModalHandlers,
} from '@/promise-modal/types';

export const AlertInner = memo(
  <B,>({
    id,
    title,
    subtitle,
    content,
    footer,
    onConfirm,
  }: AlertModal<B> & ManagedEntity & Pick<ModalHandlers, 'onConfirm'>) => {
    const handleConfirm = useCallback(() => onConfirm(id), [id, onConfirm]);

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
            })
          ) : isReactElement(content) ? (
            content
          ) : null)}
        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
            })
          ) : (
            <FooterComponent
              onConfirm={handleConfirm}
              confirmLabel={footer?.confirm}
              hideConfirm={footer?.hideConfirm}
            />
          ))}
      </Fragment>
    );
  },
);
