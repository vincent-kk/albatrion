import { ModalManager } from '@/promise-modal/app/ModalManager';

export const foreground = ModalManager.getHashedClassNames('foreground');
export const active = ModalManager.getHashedClassNames('foreground-active');
export const visible = ModalManager.getHashedClassNames('foreground-visible');

const style = `
.${foreground} {
  pointer-events: none;
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1;
}

.${foreground}.${active} > * {
  pointer-events: all;
}

.${foreground}.${visible} {
  display: flex !important;
  justify-content: center;
  align-items: center;
}
`;

ModalManager.defineStyleSheet('foreground', style);
