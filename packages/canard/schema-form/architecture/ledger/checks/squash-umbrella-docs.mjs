#!/usr/bin/env node
// Rebuild the umbrella branch so that consecutive ledger-document commits collapse into one commit per run,
// keeping every PR commit's tree, author and message, and keeping the final tree byte-identical.
// Owner decision: round 133 (reviews/round-133-owner-answers.md). Run from the repository root.
//
//   node packages/canard/schema-form/architecture/ledger/checks/squash-umbrella-docs.mjs            # dry run: prints the plan
//   node packages/canard/schema-form/architecture/ledger/checks/squash-umbrella-docs.mjs --write    # builds branch `umbrella-squashed` locally
//
// The script never pushes and never moves `1.0.0-beta`; those two steps stay manual (see the printed checklist).
import { execFileSync } from 'node:child_process';

const BASE = process.env.UMBRELLA_BASE ?? 'master';
const BRANCH = process.env.UMBRELLA_BRANCH ?? '1.0.0-beta';
const OUT = process.env.UMBRELLA_OUT ?? 'umbrella-squashed';
const DOCS_PREFIX = 'docs(schema-form)';
const write = process.argv.includes('--write');

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();

const commits = git('log', '--reverse', '--format=%H%x00%T%x00%an%x00%ae%x00%aI%x00%s', `${BASE}..${BRANCH}`)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [sha, tree, name, email, date, subject] = line.split('\0');
    return { sha, tree, name, email, date, subject, docs: subject.startsWith(DOCS_PREFIX) };
  });

// Group into kept commits and runs of consecutive docs commits.
const plan = [];
for (const c of commits) {
  const last = plan[plan.length - 1];
  if (c.docs && last && last.kind === 'run') last.items.push(c);
  else if (c.docs) plan.push({ kind: 'run', items: [c] });
  else plan.push({ kind: 'keep', item: c });
}

const roundOf = (s) => (s.match(/(\d+)라운드|round (\d+)/) ?? [])[1] ?? (s.match(/round (\d+)/) ?? [])[1];
for (const p of plan) {
  if (p.kind === 'keep') console.log(`keep  ${p.item.sha.slice(0, 9)} ${p.item.subject}`);
  else {
    const rounds = p.items.map((i) => roundOf(i.subject)).filter(Boolean);
    const span = rounds.length ? ` (rounds ${rounds[0]}–${rounds[rounds.length - 1]})` : '';
    console.log(`squash ${p.items.length} docs commits -> one${span}; last ${p.items[p.items.length - 1].sha.slice(0, 9)}`);
  }
}
console.log(`\n${commits.length} commits -> ${plan.length} commits; final tree must equal ${git('rev-parse', `${BRANCH}^{tree}`)}`);

if (!write) {
  console.log('\nDry run. Re-run with --write to build the branch locally.');
  process.exit(0);
}

let parent = git('rev-parse', BASE);
for (const p of plan) {
  if (p.kind === 'keep') {
    const c = p.item;
    const message = git('log', '-1', '--format=%B', c.sha);
    parent = execFileSync('git', ['commit-tree', c.tree, '-p', parent, '-m', message], {
      encoding: 'utf8',
      env: { ...process.env, GIT_AUTHOR_NAME: c.name, GIT_AUTHOR_EMAIL: c.email, GIT_AUTHOR_DATE: c.date },
    }).trim();
  } else {
    const last = p.items[p.items.length - 1];
    const rounds = p.items.map((i) => roundOf(i.subject)).filter(Boolean);
    const span = rounds.length ? ` — rounds ${rounds[0]}–${rounds[rounds.length - 1]}` : '';
    const body = p.items.map((i) => `${i.sha.slice(0, 9)} ${i.subject}`).join('\n');
    const message = `${DOCS_PREFIX}: ledger updates${span} (${p.items.length} commits squashed)\n\n${body}\n`;
    parent = execFileSync('git', ['commit-tree', last.tree, '-p', parent, '-m', message], {
      encoding: 'utf8',
      env: { ...process.env, GIT_AUTHOR_NAME: last.name, GIT_AUTHOR_EMAIL: last.email, GIT_AUTHOR_DATE: last.date },
    }).trim();
  }
}
git('branch', '-f', OUT, parent);
const same = git('rev-parse', `${OUT}^{tree}`) === git('rev-parse', `${BRANCH}^{tree}`);
console.log(`\nbuilt ${OUT} at ${parent.slice(0, 9)}; tree identical to ${BRANCH}: ${same}`);
if (!same) process.exit(1);
console.log(`
Manual checklist (round 133):
 1. git tag archive/umbrella-pre-squash-$(date +%Y%m%d) ${BRANCH}   and   git tag archive/stage-07-pre-rebase-$(date +%Y%m%d) feat/schema-form-switch ; push both tags
 2. git branch -f ${BRANCH} ${OUT} ; git push --force-with-lease origin ${BRANCH}
 3. Rebuild feat/schema-form-switch on the new base (single commit whose tree is the stage-07 tip after merging ${BRANCH}), verify tree equality, push --force-with-lease
 4. Run the ledger checks and the stage-07 full test suite before opening the PR`);
