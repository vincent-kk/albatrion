import { cx } from '@emotion/css';

import { useModal, useModalContext } from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import { active, root, visible } from './classNames.emotion';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const Foreground = ({ modalId, onChangeOrder }: ModalLayerProps) => {
  const { ForegroundComponent } = useModalContext();

  const { modal, onChange, onConfirm, onClose, onDestroy } = useModal(modalId);

  if (!modal) return null;

  return (
    <div
      className={cx(root, {
        [visible]: modal.manualDestroy ? modal.alive : modal.visible,
        [active]: modal.visible,
      })}
    >
      <ForegroundComponent
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
      </ForegroundComponent>
    </div>
  );
};
