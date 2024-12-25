import type { PropsWithChildren } from 'react';

import styles from './styles.module.css';

export const FallbackContent = ({ children }: PropsWithChildren) => {
  return <div className={styles.fallback}>{children}</div>;
};
