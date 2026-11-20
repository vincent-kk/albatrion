import Ajv from 'ajv';
import { resolve } from 'uri-js';
import { expect, it } from 'vitest';

import { resolveAddress } from '../resolveAddress';

/**
 * Capture native URI success or failure without giving a thrown error a special meaning.
 * @param operation - One independent resolver invocation.
 * @returns Its normalized address or native exception identity and message.
 */
const outcome = (operation: () => string) => {
  try {
    return { value: operation() };
  } catch (error) {
    return error instanceof Error
      ? { error: error.name, message: error.message }
      : { thrown: error };
  }
};

it('canonical HTTP addresses and neighbouring inputs equal the native URI resolver for every base', () => {
  const source = new Ajv({ meta: false, validateSchema: false, logger: false });
  const bases = [
    '',
    'https://parent.invalid/a/root',
    'https://parent.invalid/a/root#anchor',
    'urn:example:base',
    'relative/base',
    'http://[invalid',
    'https://BASE.invalid/a/../root',
  ];
  const references = [
    'http://a.invalid/root',
    'https://bench.invalid/root-1',
    'https://a.invalid/',
    'https://a.invalid//foo',
    'https://a.invalid/Ab9_~/-',
    'https://a..invalid/x',
    'https://xn--foo.invalid/x',
    'https://a.invalid/x\n',
    'https://a.invalid/x\r',
    'https://a.invalid/x\u2028',
    'https://a.invalid/x\t',
    'https://a.invalid/x ',
    'https://a.invalid/./x',
    'https://a.invalid/a/../x',
    'https://a.invalid/%7e',
    'HTTPS://A.INVALID/x',
    'http://a.invalid:80/x',
    'https://a.invalid:443/x',
    'https://001.002.003.004/x',
    'https://a.invalid/x#',
    'https://a.invalid/x#/',
    'https://a.invalid/x#anchor',
    '#',
    '#/foo',
    '../a',
    '',
    '%raw',
    'https://도메인.invalid/문서',
    'https://a.invalid',
    'https://user@a.invalid/x',
  ];
  const check = (base: string, address: string, seed: number) => {
    const expected = outcome(() =>
      resolve(base, address.replace(/#\/?$/, '')).replace(/#\/?$/, ''),
    );
    expect(
      outcome(() => resolveAddress(source, base, address)),
      `seed=${seed} base=${JSON.stringify(base)} address=${JSON.stringify(address)}`,
    ).toEqual(expected);
  };
  for (const base of bases)
    for (const address of references) check(base, address, -1);
  let state = 0x6a150001;
  for (let seed = 0; seed < 4096; seed++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const base = bases[state % bases.length];
    const address =
      seed % 2
        ? `https://bench-${seed}.invalid/${state % 2 ? 'A_~/x-' : '/B-_/'}${state}`
        : references[(state >>> 4) % references.length];
    check(base, address, seed);
  }
});
