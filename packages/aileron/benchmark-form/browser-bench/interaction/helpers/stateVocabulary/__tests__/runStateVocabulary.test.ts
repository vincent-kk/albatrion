// @vitest-environment node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import cases from '../../../../../fixtures/input-responsiveness/closing-cases.json';
import { observeCpu } from '../../observeCpu';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from '../registeredStateVocabularyRules';
import { runStateVocabulary } from '../runStateVocabulary';

vi.mock('../checkStateVocabularyIntegrity', () => ({
  checkStateVocabularyIntegrity: vi.fn(),
}));
vi.mock('../../observeCpu', () => ({
  observeCpu: vi.fn(() => {
    throw new Error('CPU observation must follow the getter preflight');
  }),
}));

describe('formal state-vocabulary preflight', () => {
  it('refuses skipped F reads before CPU observation or formal-start creation', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-formal-preflight-'));
    try {
      const bytes = Buffer.from('frozen fixture'),
        hash = createHash('sha256').update(bytes).digest('hex');
      fs.mkdirSync(path.join(root, 'products'));
      const bundles = Object.fromEntries(
        ['B', 'F'].map((lane) => {
          fs.mkdirSync(path.join(root, lane));
          for (const file of ['bundle.js', 'report.js'])
            fs.writeFileSync(path.join(root, lane, file), bytes);
          fs.writeFileSync(path.join(root, 'products', lane + '.mjs'), bytes);
          return [
            lane,
            {
              commit: 'fixture',
              product: { sha256: hash },
              browser: { sha256: hash },
              report: { sha256: hash },
            },
          ];
        }),
      );
      const inputs = {
        stage: rules.stage,
        lanes: ['B', 'F'],
        ruleVersion: rules.version,
        provisional: false,
        preregisteredCommit: 'fixture',
        rulesSha256: createHash('sha256')
          .update(fs.readFileSync(path.resolve('../../..', rules.rulesPath)))
          .digest('hex'),
        bundles,
      };
      const write = (name: string, value: unknown) =>
        fs.writeFileSync(path.join(root, name), JSON.stringify(value));
      write('inputs.json', inputs);
      write('clean-build-record.json', {
        lanes: Object.fromEntries(
          ['B', 'F'].map((lane) => [
            lane,
            {
              commit: 'fixture',
              exitCode: 0,
              cleanProductScope: true,
              product: { sha256: hash },
            },
          ]),
        ),
      });
      write('smoke-complete.json', { inputs, cases });
      write('smoke-reports.json', [
        {
          id: 'is-divergent-flat-2000',
          lane: 'F',
          read: { status: 'skipped', reason: 'getter absent' },
        },
      ]);
      await expect(runStateVocabulary({ root, action: 'run' })).rejects.toThrow(
        'isDivergent smoke',
      );
      expect(observeCpu).not.toHaveBeenCalled();
      expect(fs.existsSync(path.join(root, 'formal-start.json'))).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
