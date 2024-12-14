import type { UniversalModalProps } from '@/promise-modal/types';

import { Background } from '../Background';
import { Foreground } from '../Foreground';
import styles from './Presenter.module.css';

export const Presenter = (props: UniversalModalProps) => {
  return (
    <div className={styles.modal}>
      <Background {...props} />
      <Foreground {...props} />
    </div>
  );
};
