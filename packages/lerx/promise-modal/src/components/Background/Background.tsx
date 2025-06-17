import { type MouseEvent, useCallback, useMemo } from 'react';

import { cx } from '@winglet/style-utils';

import {
  useConfigurationContext,
  useModal,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import { active, background, visible } from './style';

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
      className={cx(background, {
        [active]: modal.closeOnBackdropClick && modal.visible,
        [visible]: modal.manualDestroy ? modal.alive : modal.visible,
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
