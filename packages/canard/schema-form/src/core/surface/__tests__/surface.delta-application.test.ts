import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PathKeyedMap,
  PathKeyedSet,
  blueprint,
} from '@/schema-form/core/engine';

import { fieldNodeFactory } from '../utils/fieldNodeFactory';

/** Latent storage sites; pending-exit selection has a separate cost contract. */
const LATENT_SITE =
  /(?:latentStore|pathIndex|captureExitedRaw|enterFieldNode|getCommittedDeclarationKey|encodeNodeKey|readNodeKeyPath)/;

afterEach(() => vi.restoreAllMocks());

describe('B2-P3 public setValue latent delta application', () => {
  it('uses no JSON pair encoding or decoding in latent storage on a cold branch switch', () => {
    const root = fieldNodeFactory(
      blueprint({
        type: 'object',
        properties: { kind: { type: 'string' } },
        oneOf: [
          {
            controls: { active: "./kind === 'a'" },
            properties: { a: { type: 'string', default: 'A' } },
          },
          {
            controls: { active: "./kind === 'b'" },
            properties: { b: { type: 'string', default: 'B' } },
          },
        ],
      }),
      {
        diagnostics: { status: 'stable' },
        loadSnapshot: undefined,
        latentRaw: new PathKeyedMap('pair'),
        misfitPaths: new PathKeyedSet(),
        inactiveValuesMemo: new PathKeyedMap<
          readonly { path: string; value: unknown }[]
        >('path'),
      },
    );
    root.setValue({ kind: 'a', a: 'edited' });
    const old = root.find('/a');
    const stringify = JSON.stringify;
    const parse = JSON.parse;
    const calls: string[] = [];
    const record = () => {
      const caller = new Error().stack
        ?.split('\n')
        .find(
          (frame) => frame.includes('/src/') && !frame.includes('__tests__'),
        );
      if (caller && LATENT_SITE.test(caller)) calls.push(caller);
    };
    vi.spyOn(JSON, 'stringify').mockImplementation((...args) => {
      record();
      return Reflect.apply(stringify, JSON, args);
    });
    vi.spyOn(JSON, 'parse').mockImplementation((...args) => {
      record();
      return Reflect.apply(parse, JSON, args);
    });
    root.setValue({ kind: 'b' });
    root.setValue({ kind: 'a' });
    expect(root.value).toEqual({ kind: 'a', a: 'A' });
    expect(root.find('/a')).not.toBe(old);
    expect(calls).toEqual([]);
  });
});
