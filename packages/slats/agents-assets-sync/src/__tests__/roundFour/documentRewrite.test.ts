// r4-agents-assets-sync, angles RG1 and FP4 on round 3 item 4: the AGENTS.md
// rewrite became a temporary file plus rename
// (core/injectDocs/utils/replaceDocument.ts). These probes compare what the
// rename-based rewrite keeps with what the in-place write it replaced kept.
// Public API: `runCli` in-process.
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  statSync,
  symlinkSync,
} from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
const savedHome = process.env.HOME;
afterEach(() => {
  process.env.HOME = savedHome;
  for (const root of roots.splice(0)) {
    try {
      chmodSync(join(root, 'AGENTS.md'), 0o644);
    } catch {
      // absent
    }
    removeRoot(root);
  }
});

function setup(): string {
  const root = makeRoot('r4-rewrite');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  return root;
}

const projectArgs = (root: string, agent = 'codex', ...extra: string[]) => [
  '--package=@probe/kit',
  `--agent=${agent}`,
  '--scope=project',
  `--root=${root}`,
  '--no-interactive',
  ...extra,
];

describe('user scope: a dotfiles link', () => {
  it('a ~/.codex/AGENTS.md link whose dotfiles target does not exist yet is refused without replacing the link or creating a target', async () => {
    const root = setup();
    const home = join(root, 'home');
    const dotfiles = join(root, 'dotfiles/codex');
    mkdirSync(join(home, '.codex'), { recursive: true });
    mkdirSync(dotfiles, { recursive: true });
    symlinkSync(join(dotfiles, 'AGENTS.md'), join(home, '.codex/AGENTS.md'));
    process.env.HOME = home;
    const code = await runCliCode([
      '--package=@probe/kit',
      '--agent=codex',
      '--scope=user',
      '--asset=rules',
      `--root=${root}`,
      '--no-interactive',
    ]);
    const isLink = lstatSync(join(home, '.codex/AGENTS.md')).isSymbolicLink();
    let dotfilesHasBlock = false;
    try {
      dotfilesHasBlock = readFileSync(join(dotfiles, 'AGENTS.md'), 'utf8').includes(
        '# rule',
      );
    } catch {
      // still absent
    }
    expect({ code, isLink, dotfilesHasBlock }).toEqual({
      code: 1,
      isLink: true,
      dotfilesHasBlock: false,
    });
  });

  it('control: a link whose dotfiles target exists stays a link', async () => {
    const root = setup();
    const home = join(root, 'home');
    const dotfiles = join(root, 'dotfiles/codex');
    mkdirSync(join(home, '.codex'), { recursive: true });
    writeAt(join(dotfiles, 'AGENTS.md'), '# mine\n');
    symlinkSync(join(dotfiles, 'AGENTS.md'), join(home, '.codex/AGENTS.md'));
    process.env.HOME = home;
    const code = await runCliCode([
      '--package=@probe/kit',
      '--agent=codex',
      '--scope=user',
      '--asset=rules',
      `--root=${root}`,
      '--no-interactive',
    ]);
    expect({
      code,
      isLink: lstatSync(join(home, '.codex/AGENTS.md')).isSymbolicLink(),
    }).toEqual({ code: 0, isLink: true });
  });
});

describe('permission bits', () => {
  it.each([0o664, 0o666, 0o640])(
    'a block write keeps AGENTS.md mode %o',
    async (mode) => {
      const root = setup();
      writeAt(join(root, 'AGENTS.md'), '# Team notes\n');
      chmodSync(join(root, 'AGENTS.md'), mode);
      const code = await runCliCode(projectArgs(root));
      expect({
        code,
        mode: (statSync(join(root, 'AGENTS.md')).mode & 0o777).toString(8),
      }).toEqual({ code: 0, mode: mode.toString(8) });
    },
  );

  it('a read-only AGENTS.md (0444) is refused, as a read-only claude rule file is', async () => {
    const root = setup();
    writeAt(join(root, 'AGENTS.md'), '# Team notes\n');
    chmodSync(join(root, 'AGENTS.md'), 0o444);
    const codex = await runCliCode(projectArgs(root));
    const codexAfter = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    // The claude counterpart: a diverged rule file made read-only, with --force.
    writeAt(join(root, '.claude/rules/r.md'), '# local\n');
    chmodSync(join(root, '.claude/rules/r.md'), 0o444);
    const claude = await runCliCode(
      projectArgs(root, 'claude', '--force', '--yes'),
    );
    const claudeAfter = readFileSync(join(root, '.claude/rules/r.md'), 'utf8');
    chmodSync(join(root, '.claude/rules/r.md'), 0o644);
    expect({
      codex,
      codexRewrote: codexAfter.includes('# rule'),
      claude,
      claudeRewrote: claudeAfter === '# rule\n',
    }).toEqual({ codex: 1, codexRewrote: false, claude: 1, claudeRewrote: false });
  });
});
