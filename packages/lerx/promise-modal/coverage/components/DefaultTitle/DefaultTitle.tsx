import React, { type PropsWithChildren } from 'react';

// @ts-expect-error css module
import styles from './DefaultTitle.module.css';

function DefaultTitle({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}

export default DefaultTitle;
