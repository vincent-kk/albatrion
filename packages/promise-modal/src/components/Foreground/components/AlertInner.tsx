import { Fragment, memo, useMemo } from 'react';

import { isString } from '@lumy-pack/common';
import {
  isFunctionComponent,
  isReactElement,
  useHandle,
} from '@lumy-pack/common-react';

import type { AlertNode } from '@/promise-modal/core';
import { useModalContext } from '@/promise-modal/providers';
import type { ModalActions } from '@/promise-modal/types';

interface AlertInnerProps<B> {
  modal: AlertNode<B>;
  handlers: Pick<ModalActions, 'onConfirm'>;
}

export const AlertInner = memo(
  <B,>({ modal, handlers }: AlertInnerProps<B>) => {
    const { title, subtitle, content, footer } = useMemo(() => modal, [modal]);
    const { onConfirm } = useMemo(() => handlers, [handlers]);

    const handleConfirm = useHandle(onConfirm);

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
            content({ onConfirm: handleConfirm })
          ) : isReactElement(content) ? (
            content
          ) : null)}
        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({ onConfirm: handleConfirm })
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
