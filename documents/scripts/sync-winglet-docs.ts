#!/usr/bin/env tsx
/**
 * sync-winglet-docs — Generate one MDX page per declaration that the
 * @winglet packages export, from their built .d.ts files, together with the
 * client-side redirect list `documents/redirects.winglet.json`.
 *
 * Only auto-generated pages (with <!-- sync-winglet-docs:auto -->) are
 * written or deleted; manual pages are never touched. When any exported
 * name has no page, or a documented package is not built, nothing is
 * written and the command exits with code 1.
 *
 * Usage:
 *   tsx scripts/sync-winglet-docs.ts                         # Generate/update pages and redirects
 *   tsx scripts/sync-winglet-docs.ts --check                 # Validate only (exit 1 if stale)
 *   tsx scripts/sync-winglet-docs.ts --package common-utils  # Process a single package
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { applySyncPlan } from './lib/applySyncPlan';
import { planSync } from './lib/planSync';

const DOCUMENTS_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(DOCUMENTS_DIR, 'docs');

const isCheckMode = process.argv.includes('--check');
const packageIndex = process.argv.indexOf('--package');
const packageFilter = packageIndex === -1 ? null : (process.argv[packageIndex + 1] ?? null);

const plan = planSync({ packageFilter, docsDir: DOCS_DIR, packagesDir: path.join(DOCUMENTS_DIR, '..', 'packages') });

if (plan.errors.length > 0) {
  for (const error of plan.errors) console.error(error);
  console.error(`\nsync-winglet-docs: ${plan.errors.length} error(s); nothing was written.`);
  process.exit(1);
}

const changes = [
  ...plan.writes.map(item => `${fs.existsSync(item.path) ? 'updated' : 'created'} ${path.relative(DOCUMENTS_DIR, item.path)}`),
  ...plan.deletes.map(item => `removed ${path.relative(DOCUMENTS_DIR, item)}`),
];

if (isCheckMode) {
  if (changes.length > 0) {
    for (const change of changes) console.log(`  ${change}`);
    console.log(`\n${changes.length} file(s) need updating. Run "yarn sync-winglet-docs" to update them.`);
    process.exit(1);
  }
  console.log(`sync-winglet-docs: up to date (${plan.packageCount} packages)`);
} else {
  for (const change of changes) console.log(`  ${change}`);
  applySyncPlan(plan);
  console.log(`\nsync-winglet-docs: ${changes.length} file(s) changed (${plan.packageCount} packages)`);
}
