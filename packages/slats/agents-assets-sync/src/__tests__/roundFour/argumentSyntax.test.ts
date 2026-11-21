import { afterEach, expect, it, vi } from 'vitest';

import { runCliCode } from '../roundThree/fixture.js';

afterEach(() => vi.restoreAllMocks());

it.each(['--unknown-option', '--agent', '--scope', '--package'])(
  'reports parser errors in the selected format: %s',
  async (flag) => {
    const plain = await runCliCode([flag]);
    let stdout = '';
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdout += String(chunk);
      return true;
    });
    const json = await runCliCode(['--json', flag]);
    expect({ plain, json }).toEqual({ plain: 2, json: 2 });
    expect(JSON.parse(stdout)).toMatchObject({ exitCode: 2, units: [] });
  },
);
