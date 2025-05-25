import React from 'react';

import { Button } from 'antd';
import cx from 'classnames';

import type { FooterComponentProps } from '../../../src';
import type { UserDefinedContext } from '../type';
// @ts-expect-error css module
import styles from './DefaultFooter.module.css';

function DefaultFooter({
  confirmLabel,
  hideConfirm = false,
  cancelLabel,
  hideCancel = false,
  disabled,
  onConfirm,
  onCancel,
  context,
}: FooterComponentProps<UserDefinedContext>) {
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
          style={{ color: context?.color }}
        >
          {confirmLabel || 'Confirm'}
        </Button>
      )}
      {!hideCancel && typeof onCancel === 'function' && (
        <Button
          onClick={() => {
            onCancel();
          }}
          className={cx(styles.button, styles.cancel)}
          color="primary"
          style={{ color: context?.color }}
          size="large"
        >
          {cancelLabel || 'Cancel'}
        </Button>
      )}
    </div>
  );
}

export default DefaultFooter;
