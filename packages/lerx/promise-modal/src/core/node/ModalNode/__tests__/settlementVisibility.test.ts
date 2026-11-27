import { expect, it } from 'vitest';

import { ConfirmNode } from '../ConfirmNode';

it.each([
  ['resolve', true],
  ['resolve', false],
  ['reject', true],
  ['reject', false],
] as const)(
  'captures first %s visibility=%s independently of later route updates',
  (kind, shown) => {
    const node = new ConfirmNode({
      type: 'confirm',
      id: 1,
      initiator: '/editor',
    });
    if (!shown) node.onHide();
    if (kind === 'resolve') node.onConfirm();
    else node.onReject(new Error('render failure'));
    expect(node.isVisibleAtSettlement).toBe(shown);
    node.onHide();
    node.onConfirm();
    node.onReject(new Error('second result'));
    expect(node.isVisibleAtSettlement).toBe(shown);
  },
);
