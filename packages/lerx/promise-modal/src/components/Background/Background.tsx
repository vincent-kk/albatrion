import { type MouseEvent, useCallback, useMemo } from 'react';

import { cx } from '@emotion/css';

import { useModal, useModalContext } from '@/promise-modal/providers';
import { useUserDefinedContext } from '@/promise-modal/providers/UserDefinedContext';
import type { ModalLayerProps } from '@/promise-modal/types';

import { active, background, visible } from './classNames.emotion';

export const BackgroundFrame = ({
  modalId,
  onChangeOrder,
}: ModalLayerProps) => {
  const { BackgroundComponent } = useModalContext();
  const { context: userDefinedContext } = useUserDefinedContext();
  const { modal, onClose, onChange, onConfirm, onDestroy } = useModal(modalId);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      if (modal && modal.closeOnBackdropClick && modal.visible) onClose();
      event.stopPropagation();
    },
    [modal, onClose],
  );

  const Background = useMemo(
    () => modal?.BackgroundComponent || BackgroundComponent,
    [BackgroundComponent, modal],
  );

  if (!modal) return null;

  return (
    <div
      className={cx(background, {
        [visible]: modal.manualDestroy ? modal.alive : modal.visible,
        [active]: modal.closeOnBackdropClick && modal.visible,
      })}
      onClick={handleClose}
    >
      {Background && (
        <Background
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
          context={userDefinedContext}
        />
      )}
    </div>
  );
};
