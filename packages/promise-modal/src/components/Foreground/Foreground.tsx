import { memo } from 'react';

import cx from 'clsx';

import { useModalContext } from '@/promise-modal/providers/ModalContextProvider';
import type { UniversalModalProps } from '@/promise-modal/types';

import { AlertInner } from './AlertInner';
import { ConfirmInner } from './ConfirmInner';
import styles from './Foreground.module.css';
import { PromptInner } from './PromptInner';

export const Foreground = memo(
  ({
    onConfirm,
    onClose,
    onChange,
    onCleanup,
    ...modalProps
  }: UniversalModalProps) => {
    const { ForegroundComponent } = useModalContext();

    return (
      <div
        className={cx(styles.root, {
          [styles.active]: modalProps.isValid,
        })}
      >
        <ForegroundComponent
          onChange={onChange}
          onConfirm={onConfirm}
          onClose={onClose}
          onCleanup={onCleanup}
          {...modalProps}
        >
          {modalProps.type === 'alert' && (
            <AlertInner {...modalProps} onConfirm={onConfirm} />
          )}
          {modalProps.type === 'confirm' && (
            <ConfirmInner
              {...modalProps}
              onConfirm={onConfirm}
              onClose={onClose}
            />
          )}
          {modalProps.type === 'prompt' && (
            <PromptInner
              {...modalProps}
              onChange={onChange}
              onConfirm={onConfirm}
              onClose={onClose}
            />
          )}
        </ForegroundComponent>
      </div>
    );
  },
);
