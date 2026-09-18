import { bench, describe } from 'vitest';

import { createCases } from './serialization/cases';

describe('serialization source contracts', () => {
  for (const fixture of ['small', 'dense', 'cycle', 'extended']) {
    for (const candidate of createCases(fixture).filter(
      ({ name }) =>
        !name.startsWith('factory') &&
        !name.startsWith('stable') &&
        !name.startsWith('key') &&
        name !== 'createFingerprint',
    )) {
      const run = candidate.prepare();
      bench(
        `${fixture}/${candidate.name} [${candidate.contract}]`,
        () => {
          run();
        },
        { time: 100, iterations: 30, warmupTime: 30 },
      );
    }
  }
});
