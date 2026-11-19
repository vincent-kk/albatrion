import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { InjectPlan } from '../../../../../buildPlan/index.js';
import {
  assertManagedMarkdown,
  assertRuleSource,
} from '../../../../../markerBlock/index.js';
import type { RuleSource } from '../../../../../types/ruleSource.js';

/** Validate every rule and block document before any action in its unit runs.
 * @param plan Prepared actions, including skipped sources and orphan blocks.
 * @param assetRoot Package-owned source directory.
 * @param cache Run-owned validation cache keyed by source and context.
 * @param ruleSources Checked raw bytes and normalized bodies shared by all agents.
 * @throws With the exact file, opening line and repair for unsafe Markdown.
 */
export async function validateUnitMarkdown(
  plan: InjectPlan,
  assetRoot: string,
  cache: Map<string, Promise<void>>,
  ruleSources: ReadonlyMap<string, RuleSource | null>,
): Promise<void> {
  const files = new Map<
    string,
    { file: string; optional: boolean; context: 'file' | 'block' | 'document' }
  >();
  for (const action of plan.actions) {
    if (
      action.relPath.startsWith('rules/') &&
      !['delete', 'warn-orphan', 'skip-unsupported'].includes(action.kind)
    ) {
      const file = join(assetRoot, action.relPath);
      const context = action.target.kind === 'block' ? 'block' : 'file';
      files.set(`source:${context}:${file}`, {
        file,
        context,
        optional: action.kind === 'skip-uptodate',
      });
    }
    if (action.target.kind === 'block')
      files.set(`document:${action.target.fileAbs}`, {
        file: action.target.fileAbs,
        context: 'document',
        optional: true,
      });
  }
  for (const [key, { file, context, optional }] of files) {
    let check = cache.get(key);
    if (!check) {
      check = (async () => {
        if (context !== 'document') {
          const source = ruleSources.get(file);
          if (!source) {
            if (optional) return;
            throw new Error(`Source file missing: ${file}`);
          }
          if (context === 'block') assertRuleSource(source.body, file);
          else assertManagedMarkdown(source.bytes.toString('latin1'), file);
          return;
        }
        const content = await readFile(file, 'latin1').catch(
          (error: NodeJS.ErrnoException) => {
            if (optional && error.code === 'ENOENT') return null;
            throw error;
          },
        );
        if (content !== null) assertManagedMarkdown(content, file);
      })();
      cache.set(key, check);
    }
    await check;
  }
}
