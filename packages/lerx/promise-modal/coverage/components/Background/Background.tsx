import React, {
  type ForwardedRef,
  forwardRef,
  useLayoutEffect,
  useRef,
} from 'react';

import type { ModalFrameProps} from '../../../src';
import { useModalDuration } from '../../../src';
// @ts-expect-error css module
import styles from './Background.module.css';

export const Background = forwardRef(
  (
    { visible, background }: ModalFrameProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { duration } = useModalDuration();

    useLayoutEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      if (modalRef?.current) {
        if (visible) {
          timer = setTimeout(() => {
            modalRef.current?.classList.add(styles.visible);
          });
        } else {
          timer = setTimeout(() => {
            modalRef.current?.classList.remove(styles.visible);
          });
        }
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [visible]);

    return (
      <div ref={ref}>
        <div
          ref={modalRef}
          className={styles.root}
          style={{
            transitionDuration: duration,
          }}
        >
          <h1>{background?.data}</h1>
        </div>
      </div>
    );
  },
);
