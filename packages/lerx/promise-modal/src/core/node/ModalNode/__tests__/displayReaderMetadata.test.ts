import { expect, it } from 'vitest';

import { ConfirmNode } from '../ConfirmNode';

it.each(['resolve', 'reject'] as const)(
  'preserves the first %s snapshot when runtime metadata is registered again',
  (kind) => {
    const node = new ConfirmNode({ type: 'confirm', id: 1, initiator: '/' });
    node.setDisplayReader(() => true);
    expect(node.isVisibleAtSettlement).toBe(false);
    if (kind === 'resolve') node.onConfirm();
    else node.onReject(new Error('render failure'));
    expect(node.isVisibleAtSettlement).toBe(true);
    node.setDisplayReader(() => false);
    expect(node.isVisibleAtSettlement).toBe(true);
  },
);
