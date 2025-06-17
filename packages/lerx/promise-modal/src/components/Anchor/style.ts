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
   z-index: 1000;
   transition: background-color ease-in-out;
}`;

ModalManager.defineStyleSheet('anchor', style);
