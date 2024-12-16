import React from 'react';

import { Button } from 'antd';
import cx from 'classnames';

import type { FooterComponentProps } from '../../../src';
// @ts-expect-error scss module
import styles from './DefaultFooter.module.scss';

function DefaultFooter({
  confirmLabel,
  hideConfirm = false,
  cancelLabel,
  hideCancel = false,
  disabled,
  onConfirm,
  onCancel,
}: FooterComponentProps) {
  return (
    <div className={styles.root}>
      {!hideConfirm && (
        <Button
          onClick={() => {
            onConfirm();
          }}
          className={cx(styles.button, styles.confirm)}
          disabled={disabled}
          size="large"
          color="primary"
        >
          {confirmLabel || '확인'}
        </Button>
      )}
      {!hideCancel && typeof onCancel === 'function' && (
        <Button
          onClick={() => {
            onCancel();
          }}
          className={cx(styles.button, styles.cancel)}
          color="primary"
          size="large"
        >
          {cancelLabel || '취소'}
        </Button>
      )}
    </div>
  );
}

export default DefaultFooter;
