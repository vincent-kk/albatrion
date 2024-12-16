import React, { type PropsWithChildren } from 'react';

// @ts-expect-error scss module
import styles from './DefaultContent.module.scss';

function DefaultContent({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}

export default DefaultContent;
