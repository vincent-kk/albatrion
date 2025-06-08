import { Fragment, memo, useMemo } from 'react';

import { isString } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';
import { renderComponent } from '@winglet/react-utils/render';

import type { AlertNode } from '@/promise-modal/core';
import {
  useConfigurationContext,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalActions } from '@/promise-modal/types';

interface AlertInnerProps<B> {
  modal: AlertNode<B>;
  handlers: Pick<ModalActions, 'onConfirm'>;
}

export const AlertInner = memo(
  <B,>({ modal, handlers }: AlertInnerProps<B>) => {
    const { title, subtitle, content, footer } = useMemo(() => modal, [modal]);
    const { context: userDefinedContext } = useUserDefinedContext();
    const { onConfirm } = useMemo(() => handlers, [handlers]);

    const handleConfirm = useHandle(onConfirm);

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
            })
          ))}
        {footer !== false &&
          (typeof footer === 'function' ? (
            footer({
              onConfirm: handleConfirm,
              context: userDefinedContext,
            })
          ) : (
            <FooterComponent
              onConfirm={handleConfirm}
              confirmLabel={footer?.confirm}
              hideConfirm={footer?.hideConfirm}
              context={userDefinedContext}
            />
          ))}
      </Fragment>
    );
  },
);
