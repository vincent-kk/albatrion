import cx from 'classnames';
import { memo, useCallback, useContext, useMemo, useRef } from 'react';

import { useWindowSize } from '@amata/modal/src/hooks/useWindowSize';
import { ModalContext } from '@amata/modal/src/providers/ModalProvider';
import type { UniversalModalProps } from '@amata/modal/src/types';

import styles from './Background.module.scss';

function Background({
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

  const { BackgroundComponent: _BackgroundComponent } =
    useContext(ModalContext);
  const BackgroundComponent = useMemo(
    () => _BackgroundComponent,
    [_BackgroundComponent],
  );

  const handleClose = useCallback(() => {
    onClose(modalProps.id);
  }, [onClose, modalProps.id]);

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modalProps.isVisible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          onChange={onChange}
          onConfirm={onConfirm}
          onClose={onClose}
          onCleanup={onCleanup}
          {...modalProps}
        />
      )}
    </div>
  );
}

const MemoizedBackground = memo(Background);

export default MemoizedBackground;
