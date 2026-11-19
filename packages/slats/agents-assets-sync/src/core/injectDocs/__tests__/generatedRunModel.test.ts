import { chmodSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { consumerOf, installPackage, makeRoot, removeRoot, writeAt } from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

it('preserves failed-owner bytes against a reference model in 2000 seeded real runs', async () => {
  let seed = 0x5b0a17;
  const random = (limit: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % limit; };
  for (let sequence = 0; sequence < 2000; sequence++) {
    const initialSeed = seed;
    const count = 1 + random(3);
    const agents = (['claude', 'codex', 'agents'] as const).slice(0, 1 + random(3));
    const mode = ['plain', 'json', 'ink'][random(3)];
    const stage = (['discover', 'gate', 'manifest', 'source', 'markdown', 'merge', 'apply'] as const)[random(7)];
    const force = !!random(2);
    const dryRun = !!random(2);
    const yes = !!random(2);
    const shared = !!random(2);
    const root = makeRoot('generated-owner');
    try {
      const targets = Array.from({ length: count }, (_, index) => {
        const name = `@probe/p${index}`;
        const namespace = shared ? 'shared' : `p${index}`;
        const relative = `skills/${namespace}/p${index}.md`;
        const body = `installed p${index}\n`;
        const packageRoot = installPackage(root, { name, assets: { [relative]: body }, manifest: true });
        for (const destination of new Set(agents.map((agent) => agent === 'claude' ? '.claude' : '.agents')))
          writeAt(join(root, destination, relative), body);
        return consumerOf(packageRoot, name, 'manifest');
      });
      const owner = targets[targets.length - 1];
      const relative = `skills/${shared ? 'shared' : `p${count - 1}`}/p${count - 1}.md`;
      const destinations = [...new Set(agents.map((agent) => join(root, agent === 'claude' ? '.claude' : '.agents', relative)))];
      const before = destinations.map((path) => readFileSync(path));
      const notices: string[] = [];
      if (stage === 'discover' || stage === 'gate') {
        targets.pop();
        notices.push(stage === 'gate' ? `"${owner.name}": no source hashes — injected gate failure` : `Skipping ${owner.packageRoot}/package.json: injected discovery failure`);
      } else if (stage === 'manifest') writeFileSync(join(owner.packageRoot, 'dist/agents-hashes.json'), '{invalid');
      else if (stage === 'source') unlinkSync(join(owner.assetRoot, relative));
      else if (stage === 'markdown') installPackage(root, { name: owner.name, assets: { [relative]: `installed p${count - 1}\n`, 'rules/bad.md': '~~~\nopen' }, manifest: true });
      else if (stage === 'merge' && targets.length > 1) installPackage(root, { name: owner.name, assets: { [relative]: `installed p${count - 1}\n`, [`skills/${shared ? 'shared' : 'p0'}/p0.md`]: 'conflicting bytes\n' }, manifest: true });
      else if (stage === 'apply') {
        installPackage(root, { name: owner.name, assets: { [relative]: 'updated bytes\n' }, manifest: true });
        for (const path of destinations) chmodSync(path, 0o444);
      }
      const result = await runInjection({ targets, flags: { agent: agents, scope: 'project', force, dryRun, yes, json: mode === 'json', interactive: mode === 'ink' }, originCwd: root, notices, confirm: async () => true });
      const referenceCode = stage === 'discover' || stage === 'gate' || stage === 'merge' && count === 1 ? 0 : stage === 'apply' ? dryRun ? 0 : force ? 1 : 2 : 1;
      const label = `seed=${initialSeed}, sequence=${sequence}, stage=${stage}, mode=${mode}, force=${force}, dryRun=${dryRun}, yes=${yes}`;
      expect(result.exitCode, label).toBe(referenceCode);
      for (let index = 0; index < destinations.length; index++) {
        expect(readFileSync(destinations[index]), label).toEqual(before[index]);
        if (stage === 'apply') chmodSync(destinations[index], 0o644);
      }
    } finally { removeRoot(root); }
  }
}, 120000);
