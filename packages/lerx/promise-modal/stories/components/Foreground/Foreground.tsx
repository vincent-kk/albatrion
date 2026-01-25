import React, {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
  useRef,
} from 'react';

import {
  type ModalFrameProps,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '../../../src';
// @ts-expect-error css module
import styles from './Foreground.module.css';

export const Foreground = forwardRef(
  (
    { id, visible, onClose, children }: PropsWithChildren<ModalFrameProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { duration } = useModalDuration();

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
  },
);
