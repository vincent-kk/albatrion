import React, {
  type ForwardedRef,
  type PropsWithChildren,
  forwardRef,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  type ModalFrameProps,
  useDestroyAfter,
  useModalDuration,
} from '../../../src';
import type { UserDefinedContext } from '../type';
// @ts-expect-error css module
import styles from './Foreground.module.css';

export const Foreground = forwardRef(
  (
    {
      id,
      visible,
      onClose,
      children,
      context,
    }: PropsWithChildren<ModalFrameProps<UserDefinedContext>>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { duration } = useModalDuration(id);

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
              backgroundColor: context?.backgroundColor,
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
