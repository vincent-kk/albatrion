import cx from 'clsx';

import { useModalContext, useModalHandlers } from '@/promise-modal/providers';
import type { ModalIdProps } from '@/promise-modal/types';

import styles from './Foreground.module.css';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const Foreground = ({ modalId }: ModalIdProps) => {
  const { ForegroundComponent, options } = useModalContext();

  const { getModalData, onChange, onConfirm, onClose, onDestroy } =
    useModalHandlers(modalId);

  const modal = getModalData();

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: options?.manualDestroy ? modal.alive : modal.visible,
      })}
    >
      <ForegroundComponent
        modal={modal}
        handlers={{
          onChange,
          onConfirm,
          onClose,
          onDestroy,
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
