import React, { type PropsWithChildren } from 'react';

// @ts-expect-error css module
import styles from './DefaultContent.module.css';

function DefaultContent({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}

export default DefaultContent;
