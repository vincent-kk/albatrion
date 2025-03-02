import React from 'react';

import type { WrapperComponentProps } from '../../../src';
import type { UserDefinedContext } from '../type';
// @ts-expect-error scss module
import styles from './DefaultSubtitle.module.scss';

function DefaultSubtitle({
  children,
  context,
}: WrapperComponentProps<UserDefinedContext>) {
  return (
    <div className={styles.root} style={{ color: context?.color }}>
      {children}
    </div>
  );
}

export default DefaultSubtitle;
