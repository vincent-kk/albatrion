import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { compactQuietCheck } from '../b9-1/helpers/compactQuietCheck.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';

/**
 * Persist portable full samples and compact CPU receipts without copying executable bundles.
 * @param {string} root - Completed external window root
 * @param {string} output - Repository raw/iv-5 directory
 * @param {any} evidence - Validated numerical records and manifest
 * @returns Nothing; writes compressed complete evidence and a compact CPU ledger
 */
export function saveRawEvidence(root, output, evidence) {
  fs.mkdirSync(output, { recursive: true });
  const observations = fs
    .readdirSync(path.join(root, 'cpu-prechecks'))
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const check = JSON.parse(
        fs.readFileSync(path.join(root, 'cpu-prechecks', name), 'utf8'),
      );
      return {
        ...check,
        rows: check.rows
          .slice(0, 10)
          .map(({ name, cpuPercent }) => ({ name, cpuPercent })),
      };
    });
  for (const name of fs
    .readdirSync(root)
    .filter((name) => /^quiet(?:-.*)?\.json$/.test(name)))
    observations.push(
      compactQuietCheck({
        name,
        ...JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')),
      }),
    );
  assert.ok(
    observations.length >= 440,
    'Every formal process has a CPU receipt',
  );
  for (const record of [...evidence.alternate.results])
    assert.ok(
      observations.some(
        (check) => check.pid === record.pid && check.gating === false,
      ),
      'Observation-only CPU receipt for worker ' + record.pid,
    );
  const starts = {};
  for (const kind of ['pilot', 'window']) {
    const directory = path.join(root, kind + '-start-attempts');
    starts[kind] = fs
      .readdirSync(directory)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((name) => ({
        ...compactQuietCheck({
          name,
          ...JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')),
        }),
        formalSamples: 0,
      }));
  }
  const commands = fs
    .readdirSync(root)
    .filter((name) => name.endsWith('.command.json'))
    .map((name) => ({
      name,
      ...JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')),
    }));
  for (const [name, data] of Object.entries({
    evidence: { ...evidence, commands },
    cpu: { observations, starts },
  })) {
    const portable = JSON.stringify(portableEvidence(data));
    assert.ok(
      !/\/(?:Users|private\/tmp|var\/folders)\//.test(portable),
      'No machine-local paths',
    );
    fs.writeFileSync(
      path.join(output, name + '.json.gz'),
      gzipSync(portable + '\n'),
    );
  }
}
