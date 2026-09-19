// filid:contract AC-RUNCLI-INSTALL-ROOTS
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { findInstallRoots } from '../targets/findInstallRoots.js';
import { resolvePackage } from '../targets/resolvePackage.js';
import { resolveScopeAlias } from '../targets/resolveScopeAlias.js';

vi.mock('../../../utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

function makePkg(dir: string, name: string, version = '1.0.0'): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name, version, agents: { assetPath: 'docs/agents' } }),
  );
}

// The layout pnpm leaves behind: the workspace root's own `node_modules`
// holds nothing of interest, a member owns the direct dependency, and the
// transitive one exists only in the virtual store's hoist directory.
describe('install roots — packages installed below the workspace root', () => {
  let root: string;
  let member: string;
  let hoist: string;
  let exitSpy: MockInstance<(code?: number) => never>;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'install-roots-'));
    member = join(root, 'packages', 'integrations');
    hoist = join(root, 'node_modules', '.pnpm');
    writeFileSync(join(root, 'pnpm-lock.yaml'), '');
    mkdirSync(join(root, 'node_modules'), { recursive: true });
    makePkg(join(member, 'node_modules', '@fixture', 'direct'), '@fixture/direct');
    makePkg(
      join(hoist, 'node_modules', '@fixture', 'transitive'),
      '@fixture/transitive',
    );
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    exitSpy.mockRestore();
  });

  it('lists owners of node_modules parent-first, the pnpm hoist directory last', async () => {
    mkdirSync(join(root, 'apps', 'web', 'node_modules'), { recursive: true });

    expect(await findInstallRoots(root)).toEqual([
      root,
      join(root, 'apps', 'web'),
      member,
      hoist,
    ]);
  });

  it('never descends into node_modules or a dot directory', async () => {
    mkdirSync(join(root, 'node_modules', 'dep', 'node_modules'), {
      recursive: true,
    });
    mkdirSync(join(root, '.cache', 'pkg', 'node_modules'), { recursive: true });

    expect(await findInstallRoots(root)).toEqual([root, member, hoist]);
  });

  it('stops at four levels below the root', async () => {
    mkdirSync(join(root, 'a', 'b', 'c', 'd', 'node_modules'), {
      recursive: true,
    });
    mkdirSync(join(root, 'a', 'b', 'c', 'd', 'e', 'node_modules'), {
      recursive: true,
    });

    const roots = await findInstallRoots(root);
    expect(roots).toContain(join(root, 'a', 'b', 'c', 'd'));
    expect(roots).not.toContain(join(root, 'a', 'b', 'c', 'd', 'e'));
  });

  it('resolves from the workspace root a package only a member installed', async () => {
    const meta = await resolvePackage('@fixture/direct', {}, root);

    expect(meta?.packageName).toBe('@fixture/direct');
    expect(meta?.packageRoot).toContain(join('packages', 'integrations'));
  });

  it('resolves a package that exists only in the pnpm hoist directory', async () => {
    const meta = await resolvePackage('@fixture/transitive', {}, root);

    expect(meta?.packageName).toBe('@fixture/transitive');
  });

  it('prefers the member install over the hoisted copy of the same name', async () => {
    makePkg(
      join(hoist, 'node_modules', '@fixture', 'direct'),
      '@fixture/direct',
      '0.0.1',
    );

    const meta = await resolvePackage('@fixture/direct', {}, root);
    expect(meta?.packageVersion).toBe('1.0.0');
  });

  it('reaches a sibling member from inside another member', async () => {
    const sibling = join(root, 'packages', 'other');
    mkdirSync(sibling, { recursive: true });

    const meta = await resolvePackage('@fixture/direct', {}, sibling);
    expect(meta?.packageName).toBe('@fixture/direct');
  });

  it('does not search below a cwd that no root marker claims', async () => {
    rmSync(join(root, 'pnpm-lock.yaml'));

    await expect(resolvePackage('@fixture/direct', {}, root)).rejects.toThrow(
      'process.exit(2)',
    );
  });

  it('expands a scope alias across members and the hoist directory', async () => {
    const metas = await resolveScopeAlias('fixture', root);

    expect(metas.map((meta) => meta.packageName)).toEqual([
      '@fixture/direct',
      '@fixture/transitive',
    ]);
  });
});
