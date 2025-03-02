import { useMemo } from 'react';

import { cx } from '@emotion/css';

import { useModal, useModalContext } from '@/promise-modal/providers';
import { useUserDefinedContext } from '@/promise-modal/providers/UserDefinedContext';
import type { ModalLayerProps } from '@/promise-modal/types';

import { active, foreground, visible } from './classNames.emotion';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const ForegroundFrame = ({
  modalId,
  onChangeOrder,
}: ModalLayerProps) => {
  const { ForegroundComponent } = useModalContext();
  const { context: userDefinedContext } = useUserDefinedContext();

  const { modal, onChange, onConfirm, onClose, onDestroy } = useModal(modalId);

  const Foreground = useMemo(
    () => modal?.ForegroundComponent || ForegroundComponent,
    [ForegroundComponent, modal],
  );

  if (!modal) return null;

  return (
    <div
      className={cx(foreground, {
        [visible]: modal.manualDestroy ? modal.alive : modal.visible,
        [active]: modal.visible,
      })}
    >
      <Foreground
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
      >
        {modal.type === 'alert' && (
          <AlertInner modal={modal} handlers={{ onConfirm }} />
        )}
        {modal.type === 'confirm' && (
          <ConfirmInner modal={modal} handlers={{ onConfirm, onClose }} />
        )}
        {modal.type === 'prompt' && (
          <PromptInner
            modal={modal}
            handlers={{ onChange, onConfirm, onClose }}
          />
        )}
      </Foreground>
    </div>
  );
};
