import { getRandomNumber } from '@lumy-pack/common';

export const createAnchor = (name: string, label = 'modal-anchor') => {
  const node = document.createElement(name);
  node.setAttribute('id', `${label}-${getRandomNumber()}`);
  document.body.appendChild(node);
  return node;
};
