import React, { type PropsWithChildren } from 'react';

// @ts-expect-error scss module
import styles from './DefaultTitle.module.scss';

function DefaultTitle({ children }: PropsWithChildren) {
  return <div className={styles.root}>{children}</div>;
}

export default DefaultTitle;
