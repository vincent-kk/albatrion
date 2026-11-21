import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

it('diagnostic: round-5 depth fix changes bounded alias ownership versus its parent', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'r6-winglet-clone-'));
  try {
    const results: boolean[] = [];
    for (const revision of ['90f2cdcd2^', '90f2cdcd2']) {
      const archive = execFileSync('git', ['archive', revision, 'packages/winglet/common-utils', 'tsconfig.base.json'], { cwd: '/Users/Vincent/Workspace/albatrion', maxBuffer: 50 * 1024 * 1024 });
      const extracted = spawnSync('tar', ['-x', '-C', directory], { input: archive });
      expect(extracted.status).toBe(0);
      const filename = join(directory, 'packages/winglet/common-utils/src/utils/object/clone.ts');
      // A unique query keeps each archived revision's module identity independent.
      const { clone } = await import(/* @vite-ignore */ `${filename}?revision=${revision}`);
      const shared = { child: { value: 1 } };
      let input: any = { a: { nested: shared }, b: shared };
      for (let index = 0; index < 256; index++) input = { next: input };
      let result = clone(input, 259);
      for (let index = 0; index < 256; index++) result = result.next;
      results.push(result.a.nested.child === shared.child);
    }
    expect(results).toEqual([true, false]);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
