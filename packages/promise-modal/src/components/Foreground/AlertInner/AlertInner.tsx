import { match } from 'ts-pattern';

import { isString } from 'es-toolkit';
import { memo, useCallback, useContext, useMemo } from 'react';

import { isComponentType } from '@amata/modal/src/helpers/filter';
import { ModalContext } from '@amata/modal/src/providers/ModalProvider';
import type {
  AlertContentProps,
  AlertModal,
  ManagedEntity,
  ModalHandlers,
} from '@amata/modal/src/types';

import DefaultContent from '../../DefaultContent';
import DefaultFooter from '../../DefaultFooter';
import DefaultSubtitle from '../../DefaultSubtitle';
import DefaultTitle from '../../DefaultTitle';

function AlertInner<B>({
  id,
  title,
  subtitle,
  content,
  footer,
  onConfirm,
}: AlertModal<B> & ManagedEntity & Pick<ModalHandlers, 'onConfirm'>) {
  const handleConfirm = useCallback(() => onConfirm(id), [id, onConfirm]);

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
          .when(isComponentType<AlertContentProps>, (Content) => (
            <Content onConfirm={handleConfirm} />
          ))
          .otherwise(() => content)}
      {footer !== false &&
        (typeof footer === 'function' ? (
          footer({
            onConfirm: handleConfirm,
          })
        ) : (
          <FooterFrame
            onConfirm={handleConfirm}
            confirmLabel={footer?.confirm}
            hideConfirm={footer?.hideConfirm}
          />
        ))}
    </>
  );
}

const MemoizedAlertInner = memo(AlertInner);

export default MemoizedAlertInner;
