import { expect, it } from 'vitest';

import manifest from '../../package.json';

it('publishes only runtime entry points with format-specific declarations', () => {
  expect(manifest.publishConfig.exports).toEqual({
    '.': {
      import: { types: './dist/index.d.ts', default: './dist/index.mjs' },
      require: { types: './dist/index.d.cts', default: './dist/index.cjs' },
    },
  });
});
