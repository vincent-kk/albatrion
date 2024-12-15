import { memo, useRef } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import { Background } from '@/promise-modal/components/Background';
import { Foreground } from '@/promise-modal/components/Foreground';
import { useSubscribeModal } from '@/promise-modal/hooks/useSubscribeModal';
import type { ModalIdProps } from '@/promise-modal/types';

import styles from './Presenter.module.css';

let zIndex = 1;

export const Presenter = memo(({ modalId }: ModalIdProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useSubscribeModal(modalId);
  const handleChangeOrder = useHandle(() => {
    if (ref.current) {
      ref.current.style.zIndex = `${zIndex++}`;
    }
  });
  return (
    <div ref={ref} className={styles.modal}>
      <Background modalId={modalId} onChangeOrder={handleChangeOrder} />
      <Foreground modalId={modalId} onChangeOrder={handleChangeOrder} />
    </div>
  );
});
