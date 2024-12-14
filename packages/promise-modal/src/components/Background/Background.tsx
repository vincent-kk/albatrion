import { memo, useCallback } from 'react';

import cx from 'clsx';

import { useModalContext } from '@/promise-modal/providers';
import type { UniversalModalProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = memo(
  ({
    onConfirm,
    onClose,
    onChange,
    onDestroy,
    ...modalProps
  }: UniversalModalProps) => {
    const { BackgroundComponent } = useModalContext();

    const handleClose = useCallback(() => {
      onClose(modalProps.id);
    }, [onClose, modalProps.id]);

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
  },
);
