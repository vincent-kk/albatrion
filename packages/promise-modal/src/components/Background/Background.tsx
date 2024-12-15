import { type MouseEvent, useCallback } from 'react';

import cx from 'clsx';

import { useModalContext, useModalHandlers } from '@/promise-modal/providers';
import type { ModalIdProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = ({ modalId }: ModalIdProps) => {
  const { BackgroundComponent } = useModalContext();
  const { getModalData, onClose, onChange, onConfirm, onDestroy } =
    useModalHandlers(modalId);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      onClose();
      event.stopPropagation();
    },
    [onClose],
  );

  const modal = getModalData();

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modal.visible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          modal={modal}
          handlers={{
            onChange: onChange,
            onConfirm: onConfirm,
            onClose: onClose,
            onDestroy: onDestroy,
          }}
        />
      )}
    </div>
  );
};
