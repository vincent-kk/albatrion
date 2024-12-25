import type { PropsWithChildren } from 'react';

import styles from './styles.module.css';

export const FallbackTitle = ({ children }: PropsWithChildren) => {
  return <h2 className={styles.fallback}>{children}</h2>;
};
