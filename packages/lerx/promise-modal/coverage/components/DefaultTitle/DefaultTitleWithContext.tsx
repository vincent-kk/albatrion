import React from 'react';

import type { WrapperComponentProps } from '../../../src';
import type { UserDefinedContext } from '../type';
// @ts-expect-error scss module
import styles from './DefaultTitle.module.scss';

function DefaultTitle({
  children,
  context,
}: WrapperComponentProps<UserDefinedContext>) {
  return (
    <div className={styles.root} style={{ color: context?.color }}>
      {children}
    </div>
  );
}

export default DefaultTitle;
