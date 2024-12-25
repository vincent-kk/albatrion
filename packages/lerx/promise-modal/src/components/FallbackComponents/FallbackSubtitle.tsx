import type { PropsWithChildren } from 'react';

import styles from './styles.module.css';

export const FallbackSubtitle = ({ children }: PropsWithChildren) => {
  return <h3 className={styles.fallback}>{children}</h3>;
};
