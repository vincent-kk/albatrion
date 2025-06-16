import { type MouseEvent, useCallback, useMemo } from 'react';

import { dataCondition } from '@winglet/react-utils/style-manager';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import {
  useConfigurationContext,
  useModal,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import { style } from './style';

ModalManager.defineStyleSheet('background', style);

export const BackgroundFrame = ({
  modalId,
  onChangeOrder,
}: ModalLayerProps) => {
  const { BackgroundComponent } = useConfigurationContext();
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
      data-background
      data-active={dataCondition(modal.closeOnBackdropClick && modal.visible)}
      data-visible={dataCondition(
        modal.manualDestroy ? modal.alive : modal.visible,
      )}
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
