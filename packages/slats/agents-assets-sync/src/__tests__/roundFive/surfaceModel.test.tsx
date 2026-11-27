import { chmodSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { runObservedSurface } from './helpers/runObservedSurface.js';

it('crosses real surfaces with lifecycle outcomes, failure stages, dry-run and force (seed 0x5face)', async () => {
  const cases = [
    'success',
    'long-plan',
    'orphan',
    'nothing',
    'blocked',
    'discover',
    'mixed',
    'manifest',
    'source',
    'markdown',
    'conflict',
    'read-only',
    'schema',
    'reserved',
    'flags',
  ] as const;
  for (const kind of cases)
    for (const dryRun of [false, true])
      for (const force of [false, true]) {
        const outcomes = [];
        for (const mode of ['plain', 'json', 'ink'] as const) {
          const root = makeRoot('surface-model');
          try {
            const packageRoot = installPackage(root, {
              name: '@probe/a',
              assets: {
                'skills/alpha/a.md': 'planned\n',
                ...(kind === 'long-plan'
                  ? Object.fromEntries(
                      Array.from({ length: 45 }, (_, index) => [
                        `skills/alpha/${index}.md`,
                        'planned\n',
                      ]),
                    )
                  : {}),
                ...(kind === 'markdown' ? { 'rules/bad.md': '~~~\nopen' } : {}),
              },
              manifest: true,
              ...(kind === 'schema'
                ? { manifestText: '{"schemaVersion":99}' }
                : {}),
              ...(kind === 'reserved'
                ? { manifest: { 'skills/.system/a.md': '0'.repeat(64) } }
                : {}),
              ...(kind === 'manifest' ? { manifestText: '{bad' } : {}),
            });
            let packages = '@probe/a';
            if (
              kind === 'nothing' ||
              kind === 'blocked' ||
              kind === 'read-only'
            )
              writeAt(
                join(root, '.claude/skills/alpha/a.md'),
                kind === 'nothing' ? 'planned\n' : 'edited\n',
              );
            if (kind === 'orphan')
              writeAt(join(root, '.claude/skills/alpha/retired.md'), 'old\n');
            if (kind === 'read-only')
              chmodSync(join(root, '.claude/skills/alpha/a.md'), 0o444);
            if (kind === 'source')
              unlinkSync(join(packageRoot, 'docs/agents/skills/alpha/a.md'));
            if (kind === 'discover') packages = '@missing/a';
            if (kind === 'mixed' || kind === 'conflict') {
              installPackage(root, {
                name: '@probe/b',
                assets: { 'skills/alpha/a.md': 'other\n' },
                manifest: true,
                ...(kind === 'mixed' ? { manifestText: '{bad' } : {}),
              });
              packages += ',@probe/b';
            }
            const result = await runObservedSurface(mode, root, [
              `--package=${packages}`,
              ...(dryRun ? ['--dry-run'] : []),
              ...(force ? ['--force'] : []),
              ...(kind === 'flags' ? ['--asset=invalid'] : []),
            ]);
            const expected =
              kind === 'discover' || kind === 'flags'
                ? 2
                : [
                      'mixed',
                      'manifest',
                      'source',
                      'markdown',
                      'conflict',
                      'schema',
                      'reserved',
                    ].includes(kind)
                  ? 1
                  : kind === 'blocked' ||
                      kind === 'read-only' ||
                      kind === 'orphan'
                    ? dryRun
                      ? 0
                      : !force
                        ? 2
                        : kind === 'read-only'
                          ? 1
                          : 0
                    : 0;
            expect(
              result.code,
              `seed=0x5face kind=${kind} mode=${mode} dryRun=${dryRun} force=${force}`,
            ).toBe(expected);
            outcomes.push(result);
          } finally {
            removeRoot(root);
          }
        }
        expect(outcomes[1]).toEqual(outcomes[0]);
        expect(outcomes[2]).toEqual(outcomes[0]);
      }
}, 120000);
