import { ModalManager } from '@/promise-modal/app/ModalManager';

export const background = ModalManager.getHashedClassNames('background');
export const active = ModalManager.getHashedClassNames('background-active');
export const visible = ModalManager.getHashedClassNames('background-visible');

const style = `
.${background} {
  display: none;
  position: fixed;
  inset: 0;
  z-index: -999;
  pointer-events: none;
}

.${background} > * {
  pointer-events: none;
}

.${background}.${active} {
  pointer-events: all;
}

.${background}.${visible} {
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

ModalManager.defineStyleSheet('background', style);
