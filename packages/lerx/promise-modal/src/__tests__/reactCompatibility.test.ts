import { version } from 'react';

import { version as domVersion } from 'react-dom';
import { expect, it } from 'vitest';

it('runs against the selected matching React and React DOM major versions', () => {
  const expected = process.env.REACT_COMPATIBILITY_MAJOR ?? '19';
  expect(version.split('.')[0]).toBe(expected);
  expect(domVersion.split('.')[0]).toBe(expected);
});
