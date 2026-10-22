import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';

import { canonicalGateTableJSON } from './utils/canonicalGateTableJSON';
import { countGateTableObservation } from './utils/countGateTableObservation';
import { sectionGateTableObservation } from './utils/sectionGateTableObservation';

/**
 * Compare complete small histories and sectioned large histories with disk diagnostics.
 * Vitest owns snapshot update mode; baseline capture runs with --no-file-parallelism.
 * @param fixture - Unique selection-N or wheel-N baseline name
 * @param serialized - Complete path-free observer result
 * @returns Completion after every full record and hashed section has been checked
 */
export const snapshotGateTableCase = async (
  fixture: string,
  serialized: string,
): Promise<void> => {
  const directory = fileURLToPath(new URL('../', import.meta.url));
  const canonical = canonicalGateTableJSON(JSON.parse(serialized));
  const manifestPath = join(directory, 'large.manifest.json');
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf8'))
    : {};
  if (Buffer.byteLength(canonical) <= 100_000 && !manifest[fixture]) {
    await expect(canonical + '\n').toMatchFileSnapshot(
      join(directory, fixture + '.json'),
    );
    return;
  }
  const { fixture: name, sections } = sectionGateTableObservation(serialized);
  const counts = countGateTableObservation(serialized);
  const retained = [
    'dirtyChildren',
    'selections',
    'commits',
    'timeline',
    'revivals',
    'registrations',
  ];
  const full: Record<string, unknown> = {};
  const hashes: Record<string, unknown> = {};
  const updating =
    Reflect.get(expect.getState().snapshotState, '_updateSnapshot') === 'all';
  for (const [section, value] of Object.entries(sections)) {
    if (retained.includes(section)) {
      full[section] = value;
      continue;
    }
    const actual = canonicalGateTableJSON(value);
    const record = {
      sha256: createHash('sha256').update(actual).digest('hex'),
      bytes: Buffer.byteLength(actual),
      counts,
    };
    hashes[section] = record;
    if (updating) continue;
    const expected = manifest[fixture]?.[section];
    if (record.sha256 !== expected?.sha256) {
      const outputDirectory = join(tmpdir(), 'gate-table-actual', fixture);
      mkdirSync(outputDirectory, { recursive: true });
      const output = join(outputDirectory, section + '.json');
      writeFileSync(output, actual + '\n');
      expect(
        record,
        `Section ${fixture}/${section}; actual: ${output}`,
      ).toEqual(expected);
    }
    expect(record).toEqual(expected);
  }
  if (updating) {
    manifest[fixture] = hashes;
    writeFileSync(manifestPath, canonicalGateTableJSON(manifest) + '\n');
  }
  await expect(
    canonicalGateTableJSON({ fixture: name, sections: full }) + '\n',
  ).toMatchFileSnapshot(join(directory, fixture + '.json'));
};
