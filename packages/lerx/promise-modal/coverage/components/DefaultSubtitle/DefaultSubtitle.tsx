import React, { type PropsWithChildren } from 'react';

// @ts-expect-error css module
import styles from './DefaultSubtitle.module.css';

function DefaultSubtitle({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}

export default DefaultSubtitle;
