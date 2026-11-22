// r3-agents-assets-sync: documented examples executed literally (angle CA1).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import * as api from '../../index.js';
import { PACKAGE_ROOT, makeRoot, removeRoot, writeAt } from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

describe('r3-agents-assets-sync: documented examples', () => {
  // README.md:189-199, "Programmatic API":
  //   import { computeNamespacePrefixes, injectDocs, isInteractive,
  //            isValidScope, readHashManifest, resolveScope, runCli }
  //     from '@slats/agents-assets-sync';
  it('every name in the README Programmatic API import is exported by the package entry', () => {
    const readme = readFileSync(join(PACKAGE_ROOT, 'README.md'), 'utf8');
    const example = readme.slice(readme.indexOf('## Programmatic API'));
    const names = example.match(/import\s*\{([^}]+)\}/)?.[1] ?? '';
    const missing = names
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .filter((name) => typeof Reflect.get(api, name) !== 'function');
    expect(missing).toEqual([]);
  });

  // Sibling of round-2 agents-assets-sync 5: the injector now strips a UTF-8
  // BOM from package.json (resolvePackage, resolveScopeAlias); the documented
  // build step `"build:hashes": "agents-build-hashes"` reads the same file.
  it('agents-build-hashes accepts a package.json with a UTF-8 BOM, as the injector does', () => {
    const root = makeRoot('bom-build');
    roots.push(root);
    writeFileSync(
      join(root, 'package.json'),
      `\uFEFF${JSON.stringify({
        name: '@probe/bom',
        version: '1.0.0',
        agents: { assetPath: 'docs/agents' },
      })}`,
    );
    writeAt(join(root, 'docs/agents/skills/s/SKILL.md'), '# s\n');
    const run = spawnSync(
      process.execPath,
      [join(PACKAGE_ROOT, 'scripts/agents-build-hashes.mjs')],
      { cwd: root, encoding: 'utf8' },
    );
    expect({
      status: run.status,
      written: existsSync(join(root, 'dist/agents-hashes.json')),
      stderr: run.stderr.trim(),
    }).toEqual({ status: 0, written: true, stderr: '' });
  });

  // docs/agents/skills/agents-docs-asset-wiring/knowledge/smoke-tests.md
  // (shipped agent skill), Setup: "`touch AGENTS.md` pins the project root to
  // `$DIR` instead of leaving it to whatever ancestor of /tmp happens to own an
  // anchor." The same model appears in README.md:101 and :108 and
  // docs/consumer-integration.md "Scope resolution (project)".
  it('the smoke-test setup (`touch AGENTS.md` in $DIR) pins --scope=project to $DIR', () => {
    const outer = makeRoot('smoke-outer');
    roots.push(outer);
    // makeRoot already gave `outer` a `.git`; a stray lockfile is enough too.
    writeFileSync(join(outer, 'package-lock.json'), '{}');
    const dir = join(outer, 'inject-smoke-target');
    mkdirSync(dir);
    const smoke = readFileSync(
      join(
        PACKAGE_ROOT,
        'docs/agents/skills/agents-docs-asset-wiring/knowledge/smoke-tests.md',
      ),
      'utf8',
    );
    if (smoke.includes('mkdir -p "$DIR/.git"')) mkdirSync(join(dir, '.git'));
    else writeFileSync(join(dir, 'AGENTS.md'), '');
    expect(api.resolveProjectRoot('project', dir).projectRoot).toBe(dir);
  });
});
