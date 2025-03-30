import React, { type PropsWithChildren, useRef } from 'react';

import { useOnMount } from '@winglet/react-utils';

import {
  type ModalFrameProps,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '../../../../src';
// @ts-expect-error css module
import styles from './Foreground.module.css';

interface ForegroundProps extends ModalFrameProps {
  hideAfterMs: number;
}

export const Foreground = ({
  id,
  visible,
  children,
  onClose,
  hideAfterMs,
}: PropsWithChildren<ForegroundProps>) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration();

  useOnMount(() => {
    const timer = setTimeout(onClose, hideAfterMs);
    return () => {
      clearTimeout(timer);
    };
  });

  useModalAnimation(visible, {
    onVisible: () => {
      modalRef.current?.classList.add(styles.visible);
    },
    onHidden: () => {
      modalRef.current?.classList.remove(styles.visible);
    },
  });

  useDestroyAfter(id, duration);

  return (
    <div
      className={styles.root}
      style={{
        transitionDuration: duration,
      }}
      ref={modalRef}
    >
      {children}
    </div>
  );
};
