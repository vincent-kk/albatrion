import { Fragment, memo, useMemo } from 'react';

import { isString } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';
import { renderComponent } from '@winglet/react-utils/render';

import type { ConfirmNode } from '@/promise-modal/core';
import {
  useConfigurationContext,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalActions } from '@/promise-modal/types';

interface ConfirmInnerProps<B> {
  modal: ConfirmNode<B>;
  handlers: Pick<ModalActions, 'onConfirm' | 'onClose'>;
}

export const ConfirmInner = memo(
  <B,>({ modal, handlers }: ConfirmInnerProps<B>) => {
    const { title, subtitle, content, footer } = useMemo(() => modal, [modal]);
    const { context: userDefinedContext } = useUserDefinedContext();
    const { onConfirm, onClose } = useMemo(() => handlers, [handlers]);

    const handleConfirm = useHandle(onConfirm);
    const handleClose = useHandle(onClose);

    const {
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
    } = useConfigurationContext();

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
        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
              onCancel: handleClose,
              context: userDefinedContext,
            })
          ) : (
            <FooterComponent
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
