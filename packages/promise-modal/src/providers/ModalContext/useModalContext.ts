import { useContext } from 'react';

import { ModalContext } from './ModalContext';

export const useModalContext = () => useContext(ModalContext);

export const useModalOptions = () => {
  const { options } = useContext(ModalContext);
  return options;
};

export const useModalDuration = () => {
  const { duration } = useModalOptions();
  return duration;
};

export const useModalBackdrop = () => {
  const { backdrop } = useModalOptions();
  return backdrop;
};
