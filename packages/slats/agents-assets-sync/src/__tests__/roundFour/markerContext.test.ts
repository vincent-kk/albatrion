// r4-agents-assets-sync, angle BS4: block markers in lexical contexts the
// scanner does not tell apart. README.md:60 promises that everything outside
// the tool's own blocks — other tools' blocks and hand-written prose — is
// carried through byte for byte, and src/DETAIL.md:97 that a repeated run is
// idempotent. Public API: `runCli` in-process (non-TTY, so the plain renderer).
import { readFileSync } from 'node:fs';
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
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

const RULE = 'rules/schema-form-rule.md';
const RULE_BODY = '# schema-form rule\n\nAlways use the real rule.\n';

// The marker example from packages/slats/agents-assets-sync/README.md:54-58,
// quoted verbatim inside a fenced code block of the user's own AGENTS.md.
const FENCED_README_EXAMPLE = [
  '# Team agent notes',
  '',
  'Blocks managed by agents-assets-sync look like this; do not edit them:',
  '',
  '```',
  '<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->',
  '…source bytes, verbatim…',
  '<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/schema-form-rule.md -->',
  '```',
  '',
].join('\n');

function setup(prose: string, version = '1.0.0', body = RULE_BODY): string {
  const root = makeRoot('r4-marker');
  roots.push(root);
  installPackage(root, {
    name: '@canard/schema-form',
    version,
    assets: { [RULE]: body },
    manifest: true,
  });
  writeAt(join(root, 'AGENTS.md'), prose);
  return root;
}

function args(root: string, ...extra: string[]): string[] {
  return [
    '--package=@canard/schema-form',
    '--agent=codex',
    '--scope=project',
    `--root=${root}`,
    '--no-interactive',
    ...extra,
  ];
}

describe('marker text inside a fenced code block is user prose', () => {
  it('a fenced README example does not block the install, and the rule is added as a real block', async () => {
    const root = setup(FENCED_README_EXAMPLE);
    const code = await runCliCode(args(root));
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({
      code,
      proseKept: after.startsWith(FENCED_README_EXAMPLE),
      ruleInstalled: after.includes(RULE_BODY),
    }).toEqual({ code: 0, proseKept: true, ruleInstalled: true });
  });

  it('--force --yes does not overwrite the fenced README example with the rule body', async () => {
    const root = setup(FENCED_README_EXAMPLE);
    const code = await runCliCode(args(root, '--force', '--yes'));
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({
      code,
      proseKept: after.startsWith(FENCED_README_EXAMPLE),
      // The rule must land outside the user's fence, after the closing ```.
      ruleAfterFence:
        after.lastIndexOf(RULE_BODY) > after.lastIndexOf('```'),
    }).toEqual({ code: 0, proseKept: true, ruleAfterFence: true });
  });

  it('--force does not delete a fenced example whose id names a rule the package does not ship', async () => {
    const prose = [
      '# Team agent notes',
      '',
      '```md',
      '<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/example.md -->',
      'example body',
      '<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/example.md -->',
      '```',
      '',
    ].join('\n');
    const root = setup(prose);
    const code = await runCliCode(args(root, '--force', '--yes'));
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({ code, proseKept: after.startsWith(prose) }).toEqual({
      code: 0,
      proseKept: true,
    });
  });
});

describe('duplicated blocks', () => {
  const OLD = '# schema-form rule v1\n\nUse the OLD api.\n';
  const NEW = '# schema-form rule v2\n\nUse the NEW api.\n';
  const block = (body: string, eol: string) =>
    [
      '<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->',
      ...body.replace(/\n$/, '').split('\n'),
      '<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/schema-form-rule.md -->',
      '',
    ].join(eol);

  it('an upgrade with --force leaves no stale copy of a duplicated block behind', async () => {
    // A CRLF AGENTS.md as the pre-fix tool (round 1 item 4) left it: the
    // original CRLF block plus the LF copy it appended on the next run.
    const prose = `# Notes\r\n\r\n${block(OLD, '\r\n')}`;
    const root = setup(`${prose}${block(OLD, '\n')}`, '2.0.0', NEW);
    const forced = await runCliCode(args(root, '--force', '--yes'));
    const rerun = await runCliCode(args(root));
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({
      forced,
      rerun,
      staleRuleLeft: after.includes('Use the OLD api.'),
    }).toEqual({ forced: 0, rerun: 0, staleRuleLeft: false });
  });

  it('an upgrade with --force updates every copy of an LF-duplicated block', async () => {
    const root = setup(
      `# Notes\n\n${block(OLD, '\n')}\n${block(OLD, '\n')}`,
      '2.0.0',
      NEW,
    );
    await runCliCode(args(root, '--force', '--yes'));
    const rerun = await runCliCode(args(root));
    const after = readFileSync(join(root, 'AGENTS.md'), 'utf8');
    expect({
      rerun,
      staleRuleLeft: after.includes('Use the OLD api.'),
    }).toEqual({ rerun: 0, staleRuleLeft: false });
  });
});

