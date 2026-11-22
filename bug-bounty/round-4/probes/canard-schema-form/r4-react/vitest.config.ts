// Probe-local config: resolves workspace @winglet/* packages from their src through the
// "source" export condition and the packages' internal '@/<name>' aliases, instead of stale dist.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { mergeConfig } from 'vitest/config';

import base from '../../../vite.config';

const here = dirname(fileURLToPath(import.meta.url));
const winglet = resolve(here, '../../../../../winglet');

export default mergeConfig(base, {
  resolve: {
    conditions: ['source', ...defaultClientConditions],
    alias: [
      { find: '@/common-utils', replacement: resolve(winglet, 'common-utils/src') },
      { find: '@/json-schema', replacement: resolve(winglet, 'json-schema/src') },
      { find: '@/json', replacement: resolve(winglet, 'json/src') },
      { find: '@/react-utils', replacement: resolve(winglet, 'react-utils/src') },
      { find: '@/style-utils', replacement: resolve(winglet, 'style-utils/src') },
      { find: '@/data-loader', replacement: resolve(winglet, 'data-loader/src') },
    ],
  },
  ssr: {
    resolve: {
      conditions: ['source', ...defaultServerConditions],
    },
  },
});
