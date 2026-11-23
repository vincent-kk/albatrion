import { createContext, runInContext } from 'node:vm';
import { isEmpty } from '@winglet/common-utils';

export default {
  pkg: '@winglet/common-utils', fn: 'isEmpty', input: '300000 independent foreign Maps', inputKind: 'plain', kind: 'micro',
  setup: () => {
    const context = createContext({});
    const maps = runInContext('Array.from({ length: 300000 }, () => new Map([[1, 2]]))', context);
    return {
      run: () => { let count = 0; for (const map of maps) if (isEmpty(map)) count++; return count; },
      check: (count) => count === maps.length,
    };
  },
};
