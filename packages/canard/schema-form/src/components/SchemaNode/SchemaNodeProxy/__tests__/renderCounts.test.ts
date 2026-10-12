import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';

interface Scenario {
  mode: string;
  fibersPerField: Record<string, number>;
  writes: {
    write: string;
    target: string;
    renders: { byPath: Record<string, number> };
    remounts: string[];
  }[];
}

let scenarios: Scenario[];
beforeAll(() => {
  const tool = fileURLToPath(
    new URL('./helpers/runtimeCounts.mjs', import.meta.url),
  );
  const output = execFileSync(
    process.execPath,
    [tool, 'current', '--counts-only'],
    {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  scenarios = JSON.parse(output).scenarios;
}, 120000);

it('F-B holds 19 live fibers per field in both controlled and uncontrolled forms', () => {
  expect(
    scenarios.map(({ fibersPerField }) => Object.values(fibersPerField)),
  ).toEqual([
    [19, 19, 19, 19],
    [19, 19, 19, 19],
  ]);
});

it('F-B performs nine component renders per own field write with identical controlled and uncontrolled counts', () => {
  for (const scenario of scenarios) {
    const ownWrites = scenario.writes.filter(
      ({ write, target }) =>
        target !== null &&
        write !== 'same-value setValue /b' &&
        write !== 'refresh /a',
    );
    expect(
      ownWrites.map(({ target, renders }) => renders.byPath[target]),
    ).toEqual([9, 9, 9, 9, 9]);
  }
});

it('119 isolation keeps unchanged fields at zero renders for leaf, sibling and parent writes', () => {
  for (const scenario of scenarios) {
    for (const { target, renders, write } of scenario.writes) {
      if (target === null) continue;
      for (const path of ['/a', '/b', '/o/x', '/o/y'])
        if (path !== target)
          expect(
            renders.byPath[path] ?? 0,
            `${scenario.mode}: ${write}: ${path}`,
          ).toBe(0);
    }
    expect(
      scenario.writes.find(({ write }) => write === 'refresh /a')!.remounts,
    ).toEqual(['/a']);
  }
});

it('F-B renders each field nine times for global context and error visibility changes and four times for readOnly', () => {
  for (const scenario of scenarios) {
    for (const write of [
      'showError(true)',
      'Form context prop change',
      'Form readOnly prop true',
    ]) {
      const result = scenario.writes.find((item) => item.write === write)!;
      expect(
        ['/a', '/b', '/o/x', '/o/y'].map((path) => result.renders.byPath[path]),
      ).toEqual(Array(4).fill(write === 'Form readOnly prop true' ? 4 : 9));
      expect(result.remounts).toEqual([]);
    }
  }
});
