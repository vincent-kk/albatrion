import { type MouseEvent, useCallback } from 'react';

import cx from 'clsx';

import { useModalContext, useModalHandlers } from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import styles from './Background.module.css';

export const Background = ({ modalId, onChangeOrder }: ModalLayerProps) => {
  const { BackgroundComponent, options } = useModalContext();
  const { getModalData, onClose, onChange, onConfirm, onDestroy } =
    useModalHandlers(modalId);

  const modal = getModalData();

  const closeOnBackdropClick =
    modal?.closeOnBackdropClick &&
    options.closeOnBackdropClick &&
    modal?.visible;

  const handleClose = useCallback(
    (event: MouseEvent) => {
      if (closeOnBackdropClick) onClose();
      event.stopPropagation();
    },
    [closeOnBackdropClick, onClose],
  );

  if (!modal) return null;

  return (
    <div
      className={cx(styles.root, {
        [styles.clickable]: modal?.visible,
      })}
      onClick={handleClose}
    >
      {BackgroundComponent && (
        <BackgroundComponent
          modal={modal}
          handlers={{
            onChange,
            onConfirm,
            onClose,
            onDestroy,
            onChangeOrder,
          }}
        />
      )}
    </div>
  );
};
