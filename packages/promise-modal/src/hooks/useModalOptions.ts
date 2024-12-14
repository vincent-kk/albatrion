import { useContext } from 'react';

import { ModalContext } from '../providers/ModalProvider';

export function useModalOptions() {
  const { options } = useContext(ModalContext);
  return options;
}

export function useModalDuration() {
  const { duration } = useModalOptions();
  return duration;
}

export function useModalBackdrop() {
  const { backdrop } = useModalOptions();
  return backdrop;
}
