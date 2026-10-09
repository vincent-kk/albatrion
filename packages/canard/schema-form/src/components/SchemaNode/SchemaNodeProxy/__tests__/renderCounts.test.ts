import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, it } from 'vitest';

interface Scenario {
  mode: string;
  fibersPerField: Record<string, number>;
  writes: {
    write: string; target: string;
    renders: { byPath: Record<string, number> };
    remounts: string[];
  }[];
}

let scenarios: Scenario[];
beforeAll(() => {
  const tool = fileURLToPath(new URL('../../../../../architecture/verification/07-switch/tools/measure-react-render-counts.mjs', import.meta.url));
  const output = execFileSync(process.execPath, [tool, 'current', '--counts-only'], {
    encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024,
  });
  scenarios = JSON.parse(output).scenarios;
}, 120000);

it("F-A' holds 20 live fibers per field in both controlled and uncontrolled forms", () => {
  expect(scenarios.map(({ fibersPerField }) => Object.values(fibersPerField)))
    .toEqual([[20, 20, 20, 20], [20, 20, 20, 20]]);
});

it('119 performs ten component renders per own field write with identical controlled and uncontrolled counts', () => {
  for (const scenario of scenarios) {
    const ownWrites = scenario.writes.filter(({ write }) => write !== 'same-value setValue /b' && write !== 'refresh /a');
    expect(ownWrites.map(({ target, renders }) => renders.byPath[target]))
      .toEqual([10, 10, 10, 10, 10]);
  }
});

it('119 isolation keeps unchanged fields at zero renders for leaf, sibling and parent writes', () => {
  for (const scenario of scenarios) {
    for (const { target, renders, write } of scenario.writes) {
      for (const path of ['/a', '/b', '/o/x', '/o/y'])
        if (path !== target) expect(renders.byPath[path] ?? 0, `${scenario.mode}: ${write}: ${path}`).toBe(0);
    }
    expect(scenario.writes.find(({ write }) => write === 'refresh /a')!.remounts).toEqual(['/a']);
  }
});
