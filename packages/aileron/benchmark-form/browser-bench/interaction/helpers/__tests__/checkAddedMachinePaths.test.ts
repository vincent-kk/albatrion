import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { checkAddedMachinePaths } from '../checkAddedMachinePaths';

describe('explicit browser-result change audit', () => {
  let repository: string;
  let base: string;
  const machinePath = '/' + 'Users/example/retained-data';

  beforeEach(() => {
    repository = fs.mkdtempSync(path.join(os.tmpdir(), 'browser-audit-'));
    execFileSync('git', ['init', '--quiet'], { cwd: repository });
    fs.writeFileSync(path.join(repository, 'record.md'), machinePath + '\n');
    execFileSync('git', ['add', '--', 'record.md'], { cwd: repository });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Vincent Kelvin',
        '-c',
        'user.email=fixture@example.invalid',
        '-c',
        'commit.gpgsign=false',
        'commit',
        '--quiet',
        '-m',
        'audit fixture baseline',
      ],
      { cwd: repository },
    );
    base = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repository,
      encoding: 'utf8',
    }).trim();
  });

  afterEach(() => fs.rmSync(repository, { recursive: true, force: true }));

  it('accepts a safe addition while preserving historical paths verbatim', () => {
    fs.appendFileSync(path.join(repository, 'record.md'), 'new evidence\n');
    expect(() => checkAddedMachinePaths(repository, base)).not.toThrow();
  });

  it('rejects a machine path newly added to a tracked record', () => {
    fs.appendFileSync(path.join(repository, 'record.md'), machinePath + '\n');
    expect(() => checkAddedMachinePaths(repository, base)).toThrow(
      'record.md contains a new machine path',
    );
  });

  it('rejects a machine path in an untracked record', () => {
    fs.writeFileSync(path.join(repository, 'new.md'), machinePath);
    expect(() => checkAddedMachinePaths(repository, base)).toThrow(
      'new.md contains a new machine path',
    );
  });

  it('audits decompressed evidence when its binary diff hides the content', () => {
    fs.writeFileSync(
      path.join(repository, 'raw.json.gz'),
      gzipSync(JSON.stringify({ source: machinePath })),
    );
    execFileSync('git', ['add', '--', 'raw.json.gz'], { cwd: repository });
    expect(() => checkAddedMachinePaths(repository, base)).toThrow(
      'raw.json.gz contains a new machine path',
    );
  });
});
