import { type PropsWithChildren, useRef } from 'react';

import {
  type ModalFrameProps,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '../../src';

/** Names the demo dialog and animates with its effective per-modal duration. */
export function HardeningFrame({
  id,
  visible,
  children,
  type,
}: PropsWithChildren<ModalFrameProps>) {
  const ref = useRef<HTMLElement>(null);
  const { duration } = useModalDuration(id);
  useModalAnimation(visible, {
    onVisible: () => {
      if (ref.current) ref.current.style.opacity = '1';
    },
    onHidden: () => {
      if (ref.current) ref.current.style.opacity = '0';
    },
  });
  useDestroyAfter(id, duration);
  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-hidden={!visible}
      aria-label={`${type} demonstration`}
      style={{
        background: 'white',
        color: '#222',
        padding: 24,
        maxWidth: 520,
        opacity: 0,
        transition: `opacity ${duration}`,
      }}
    >
      <p>Effective transition: {duration}</p>
      {children}
    </section>
  );
}
