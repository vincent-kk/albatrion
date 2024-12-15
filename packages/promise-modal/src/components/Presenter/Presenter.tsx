import type { ModalIdProps } from '@/promise-modal/types';

import { Background } from '../Background';
import { Foreground } from '../Foreground';
import styles from './Presenter.module.css';

export const Presenter = ({ modalId }: ModalIdProps) => {
  return (
    <div className={styles.modal}>
      <Background modalId={modalId} />
      <Foreground modalId={modalId} />
    </div>
  );
};
