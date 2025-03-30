import React, { type ReactNode } from 'react';

import { type ModalFrameProps, alert } from '../../../src';
import { Foreground } from './Foreground';

interface ToastProps {
  message: ReactNode;
  duration?: number;
}

let onDestroyPrevTost: () => void;

export const toast = ({ message, duration = 1250 }: ToastProps) => {
  onDestroyPrevTost?.();
  return alert({
    content: message,
    ForegroundComponent: (props: ModalFrameProps) => {
      onDestroyPrevTost = props.onDestroy;
      return <Foreground {...props} hideAfterMs={duration} />;
    },
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
  });
};
