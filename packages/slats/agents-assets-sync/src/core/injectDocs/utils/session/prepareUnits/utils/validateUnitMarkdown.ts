import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { InjectPlan, RuleSource } from '../../../../../buildPlan/index.js';
import { assertManagedMarkdown } from '../../../../../markerBlock/index.js';
import { normalizeRuleSource } from '../../../../../utils/normalizeRuleSource.js';

/** Validate every rule and block document before any action in its unit runs.
 * @param plan Prepared actions, including skipped sources and orphan blocks.
 * @param assetRoot Package-owned source directory.
 * @param cache Run-owned read cache shared across packages and agents.
 * @throws With the exact file, opening line and repair for unsafe Markdown.
 */
export async function validateUnitMarkdown(
  plan: InjectPlan,
  assetRoot: string,
  cache: Map<string, Promise<void>>,
  ruleSources: ReadonlyMap<string, RuleSource | null> = new Map(),
): Promise<void> {
  const files = new Map<string, { file: string; optional: boolean }>();
  for (const action of plan.actions) {
    if (
      action.relPath.startsWith('rules/') &&
      action.kind !== 'delete' &&
      action.kind !== 'warn-orphan' &&
      action.kind !== 'skip-unsupported'
    ) {
      const file = join(assetRoot, action.relPath);
      files.set(`source:${file}`, {
        file,
        optional: action.kind === 'skip-uptodate',
      });
    }
    if (action.target.kind === 'block')
      files.set(`document:${action.target.fileAbs}`, {
        file: action.target.fileAbs,
        optional: true,
      });
  }
  for (const [key, { file, optional }] of files) {
    let check = cache.get(key);
    if (!check) {
      const sourceBody = key.startsWith('source:')
        ? ruleSources.get(file)?.body
        : undefined;
      check = (
        sourceBody === undefined
          ? readFile(file, 'latin1')
          : Promise.resolve(sourceBody)
      ).then(
        (content) => {
          assertManagedMarkdown(
            key.startsWith('document:')
              ? content
              : sourceBody ?? normalizeRuleSource(content),
            file,
          );
        },
        (error: unknown) => {
          if (
            optional &&
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT'
          )
            return;
          throw error;
        },
      );
      cache.set(key, check);
    }
    await check;
  }
}
