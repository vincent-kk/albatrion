import { ModalManager } from '@/promise-modal/app/ModalManager';

export const anchor = ModalManager.getHashedClassNames('anchor');

const style = `
.${anchor} {
   display: flex;
   align-items: center;
   justify-content: center;
   position: fixed;
   inset: 0;
   pointer-events: none;
   z-index: var(--z-index);
}`;

export const backdrop = ModalManager.getHashedClassNames('backdrop');

const backdropStyle = `
.${backdrop} {
  position: fixed;
  inset: 0;
  opacity: 0;
  transition-property: opacity;
  transition-duration: var(--transition-duration);
  transition-timing-function: ease-in-out;
  pointer-events: none;
}`;

ModalManager.defineStyleSheet('anchor', style);
ModalManager.defineStyleSheet('backdrop', backdropStyle);
