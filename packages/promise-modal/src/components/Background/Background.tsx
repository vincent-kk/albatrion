import { type MouseEvent, memo, useCallback, useMemo } from 'react';

import cx from 'clsx';

import { useModalContext } from '@/promise-modal/providers';
import type { UniversalModalProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = memo((props: UniversalModalProps) => {
  const { BackgroundComponent } = useModalContext();

  const { onConfirm, onClose, onChange, onDestroy, modalProps } =
    useMemo(() => {
      const { onConfirm, onClose, onChange, onDestroy, ...modalProps } = props;
      return {
        onConfirm,
        onClose,
        onChange,
        onDestroy,
        modalProps,
      };
    }, [props]);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      onClose(modalProps.id);
      event.stopPropagation();
    },
    [modalProps.id, onClose],
  );

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modalProps.visible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          onChange={onChange}
          onConfirm={onConfirm}
          onClose={onClose}
          onDestroy={onDestroy}
          {...modalProps}
        />
      )}
    </div>
  );
});
