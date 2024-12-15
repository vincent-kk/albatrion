import { type MouseEvent, useCallback } from 'react';

import cx from 'clsx';

import { useModalContext, useModalHandlers } from '@/promise-modal/providers';
import type { ModalIdProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = ({ modalId }: ModalIdProps) => {
  const { BackgroundComponent, options } = useModalContext();
  const { getModalData, onClose, onChange, onConfirm, onDestroy } =
    useModalHandlers(modalId);

  const modal = getModalData();

  const backdropClickable = options.closeOnBackdropClick && modal?.visible;

  const handleClose = useCallback(
    (event: MouseEvent) => {
      if (backdropClickable) onClose();
      event.stopPropagation();
    },
    [onClose, backdropClickable],
  );

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.clickable]: backdropClickable,
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
