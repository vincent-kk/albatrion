import { type MouseEvent, useCallback } from 'react';

import { cx } from '@emotion/css';

import { useModal, useModalContext } from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import { active, root, visible } from './classNames.emotion';

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

  const isVisible = modal.manualDestroy ? modal.alive : modal.visible;

  return (
    <div
      className={cx(root, {
        [visible]: isVisible,
        [active]: modal.closeOnBackdropClick && isVisible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          id={modal.id}
          type={modal.type}
          alive={modal.alive}
          visible={modal.visible}
          initiator={modal.initiator}
          manualDestroy={modal.manualDestroy}
          closeOnBackdropClick={modal.closeOnBackdropClick}
          background={modal.background}
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
