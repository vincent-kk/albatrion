import React, {
  type ForwardedRef,
  forwardRef,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  type ModalFrameProps,
  useDestroyAfter,
  useModalDuration,
} from '../../../src';
// @ts-expect-error scss module
import styles from './Foreground.module.scss';

function Foreground(
  { id, visible, onClose, children }: ModalFrameProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration();

  useLayoutEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (modalRef?.current) {
      const { current } = modalRef;
      if (visible) {
        timer = setTimeout(() => {
          current.classList.add(styles.visible);
        });
      } else {
        timer = setTimeout(() => {
          current.classList.remove(styles.visible);
        });
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible]);

  useDestroyAfter(id, duration);

  return (
    <div className={styles.root}>
      <div ref={ref}>
        <div
          className={styles.body}
          style={{
            transitionDuration: duration,
          }}
          ref={modalRef}
        >
          <div
            className={styles.handle}
            onClick={() => {
              onClose();
            }}
          />
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export const ForegroundWithRef = forwardRef(Foreground);
