import { ModalManager } from '@/promise-modal/app/ModalManager';

export const presenter = ModalManager.getHashedClassNames('presenter');

const style = `
.${presenter} {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`;

ModalManager.defineStyleSheet('presenter', style);
