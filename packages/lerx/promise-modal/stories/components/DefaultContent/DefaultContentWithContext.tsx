import React from 'react';

import type { WrapperComponentProps } from '../../../src';
import type { UserDefinedContext } from '../type';
// @ts-expect-error css module
import styles from './DefaultContent.module.css';

function DefaultContent({
  children,
  context,
}: WrapperComponentProps<UserDefinedContext>) {
  return (
    <div className={styles.root} style={{ color: context?.color }}>
      {children}
    </div>
  );
}

export default DefaultContent;
