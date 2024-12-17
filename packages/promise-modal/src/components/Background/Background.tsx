import { type MouseEvent, useCallback } from 'react';

import cx from 'clsx';

import { useModal, useModalContext } from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = ({ modalId, onChangeOrder }: ModalLayerProps) => {
  const { BackgroundComponent } = useModalContext();
  const { modal, onClose, onChange, onConfirm, onDestroy } = useModal(modalId);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      if (modal && modal.closeOnBackdropClick && modal.visible) onClose();
      event.stopPropagation();
    },
    [modal, onClose],
  );

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modal.closeOnBackdropClick && modal.visible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          id={modal.id}
          initiator={modal.initiator}
          type={modal.type}
          alive={modal.alive}
          visible={modal.visible}
          manualDestroy={modal.manualDestroy}
          closeOnBackdropClick={modal.closeOnBackdropClick}
          onChange={onChange}
          onConfirm={onConfirm}
          onClose={onClose}
          onDestroy={onDestroy}
          onChangeOrder={onChangeOrder}
        />
      )}
    </div>
  );
};
