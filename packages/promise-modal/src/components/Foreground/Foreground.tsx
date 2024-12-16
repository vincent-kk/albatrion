import cx from 'clsx';

import { useModal, useModalContext } from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import styles from './Foreground.module.css';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const Foreground = ({ modalId, onChangeOrder }: ModalLayerProps) => {
  const { ForegroundComponent, options } = useModalContext();

  const { modal, onChange, onConfirm, onClose, onDestroy } = useModal(modalId);

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.active]:
          modal.manualDestroy || options?.manualDestroy
            ? modal.alive
            : modal.visible,
      })}
    >
      <ForegroundComponent
        modal={modal}
        handlers={{
          onChange,
          onConfirm,
          onClose,
          onDestroy,
          onChangeOrder,
        }}
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
