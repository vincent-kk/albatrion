import { memo, useMemo } from 'react';

import cx from 'clsx';

import { useModalContext } from '@/promise-modal/providers';
import type { UniversalModalProps } from '@/promise-modal/types';

import styles from './Foreground.module.css';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const Foreground = memo((props: UniversalModalProps) => {
  const { ForegroundComponent } = useModalContext();

  const { onConfirm, onClose, onChange, onDestroy, modalProps } =
    useMemo(() => {
      const { onConfirm, onClose, onChange, onDestroy, ...modalProps } = props;
      return {
        onConfirm,
        onClose,
        onChange,
        onDestroy,
        modalProps,
      };
    }, [props]);

  return (
    <div
      className={cx(styles.root, {
        [styles.active]: modalProps.alive,
      })}
    >
      <ForegroundComponent
        {...modalProps}
        onChange={onChange}
        onConfirm={onConfirm}
        onClose={onClose}
        onDestroy={onDestroy}
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
});
