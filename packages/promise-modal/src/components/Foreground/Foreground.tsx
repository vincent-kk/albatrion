import { Fragment, type MouseEvent, memo, useMemo } from 'react';

import cx from 'clsx';

import { useHandle } from '@lumy-pack/common-react';

import { useModalContext } from '@/promise-modal/providers';
import type { UniversalModalProps } from '@/promise-modal/types';

import styles from './Foreground.module.css';
import { AlertInner, ConfirmInner, PromptInner } from './components';

export const Foreground = memo((props: UniversalModalProps) => {
  const { ForegroundComponent } = useModalContext();

  const {
    onConfirm,
    onClose,
    onChange,
    onDestroy,
    closeOnBackgroundClick,
    modalProps,
  } = useMemo(() => {
    const {
      onConfirm,
      onClose,
      onChange,
      onDestroy,
      closeOnBackgroundClick,
      ...modalProps
    } = props;
    return {
      onConfirm,
      onClose,
      onChange,
      onDestroy,
      closeOnBackgroundClick,
      modalProps,
    };
  }, [props]);

  const handleClose = useHandle((event: MouseEvent) => {
    if (closeOnBackgroundClick) onClose(modalProps.id);
    event.stopPropagation();
  });

  return (
    <Fragment>
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
      <div
        className={cx(styles.backdrop, {
          [styles.active]: modalProps.alive,
        })}
        onClick={handleClose}
      />
    </Fragment>
  );
});
