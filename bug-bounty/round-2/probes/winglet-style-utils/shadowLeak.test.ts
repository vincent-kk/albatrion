import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { styleManagerFactory } from '@/style-utils/index';

setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc') as () => void;

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 50));

const createHostWithStyles = async (scopeId: string, cleanUp: boolean) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const addStyle = styleManagerFactory(scopeId, { shadowRoot });
  const remove = addStyle('host', ':host { display: block; }');
  await nextFrame();
  if (cleanUp) remove();
  await nextFrame();
  host.remove();
  return new WeakRef(host);
};

const collect = async () => {
  for (let i = 0; i < 10; i++) {
    gc();
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

describe('shadow-root managers are released with their host', () => {
  it('control: a detached host that never used styleManagerFactory is collected', async () => {
    const ref = (() => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      host.attachShadow({ mode: 'open' });
      host.remove();
      return new WeakRef(host);
    })();
    await collect();
    expect(ref.deref()).toBeUndefined();
  });

  it('a detached shadow host whose styles were all cleaned up is garbage-collected', async () => {
    const ref = await createHostWithStyles('bounty-leak-clean', true);
    await collect();
    expect(ref.deref()).toBeUndefined();
  });
});
