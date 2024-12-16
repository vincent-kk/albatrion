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
  { modal, handlers, children }: ModalFrameProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { onClose } = handlers;
  const modalRef = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration();

  useLayoutEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (modalRef?.current) {
      const { current } = modalRef;
      if (modal.visible) {
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
  }, [modal.visible]);

  useDestroyAfter(modal.id, duration);

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
