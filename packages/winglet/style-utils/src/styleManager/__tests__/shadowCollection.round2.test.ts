import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';

import { expect, it } from 'vitest';

import { styleManagerFactory } from '../styleManagerFactory';

setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc');
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const createHost = async (withStyles: boolean) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  if (withStyles) {
    const cleanup = styleManagerFactory('collected', { shadowRoot })('x', ':host{display:block}');
    await pause(30); cleanup(); await pause(30);
  }
  host.remove();
  return new WeakRef(host);
};
it('round-2 style-utils 1: collects styled detached hosts like unstyled hosts', async () => {
  const control = await createHost(false);
  const styled = await createHost(true);
  for (let i = 0; i < 10; i++) { gc(); await pause(10); }
  expect(control.deref()).toBeUndefined();
  expect(styled.deref()).toBe(control.deref());
});
