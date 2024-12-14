import cx from 'classnames';
import { memo, useContext, useMemo, useRef } from 'react';

import { useWindowSize } from '@amata/modal/src/hooks/useWindowSize';
import { ModalContext } from '@amata/modal/src/providers/ModalProvider';
import type { UniversalModalProps } from '@amata/modal/src/types';

import { DefaultForegroundFrameWithRef } from '../DefaultForegroundFrame';
import AlertInner from './AlertInner';
import ConfirmInner from './ConfirmInner';
import styles from './Foreground.module.scss';
import PromptInner from './PromptInner';

function Foreground({
  onConfirm,
  onClose,
  onChange,
  onCleanup,
  ...modalProps
}: UniversalModalProps) {
  const { height: windowHeight } = useWindowSize();
  const areaRef = useRef<HTMLDivElement>(null);

  const modalHeight = areaRef.current?.clientHeight;
  const needScroll = modalHeight && modalHeight >= windowHeight;

  const { ForegroundComponent } = useContext(ModalContext);
  const ForegroundFrame = useMemo(
    () => ForegroundComponent || DefaultForegroundFrameWithRef,
    [ForegroundComponent],
  );

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modalProps.isValid,
      })}
    >
      <ForegroundFrame
        ref={areaRef}
        onChange={onChange}
        onConfirm={onConfirm}
        onClose={onClose}
        onCleanup={onCleanup}
        {...modalProps}
      >
        {modalProps.type === 'alert' && (
          <AlertInner {...modalProps} onConfirm={onConfirm} />
        )}
        {modalProps.type === 'confirm' && (
          <ConfirmInner
            {...modalProps}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )}
        {modalProps.type === 'prompt' && (
          <PromptInner
            {...modalProps}
            onChange={onChange}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )}
      </ForegroundFrame>
    </div>
  );
}

const MemoizedForeground = memo(Foreground);

export default MemoizedForeground;
