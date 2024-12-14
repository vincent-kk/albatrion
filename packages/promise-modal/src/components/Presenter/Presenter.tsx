import type { UniversalModalProps } from '@amata/modal/src/types';

import Background from '../Background';
import Foreground from '../Foreground';
import styles from './Presenter.module.scss';

function Presenter(props: UniversalModalProps) {
  return (
    <div className={styles.modal}>
      <Background {...props} />
      <Foreground {...props} />
    </div>
  );
}

export default Presenter;
