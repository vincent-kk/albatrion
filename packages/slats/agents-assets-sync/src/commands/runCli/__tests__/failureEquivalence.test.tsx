import { realpathSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'ink-testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import { installPackage, makeRoot, removeRoot, writeAt } from '../../../__tests__/roundThree/fixture.js';
import type { RunResult } from '../../../core/index.js';
import { InjectApp } from '../../../ui/InjectApp/InjectApp.js';
import * as ui from '../../../ui/index.js';
import { runCli } from '../runCli.js';
import * as views from '../renderers/renderOrFallback.js';
const roots: string[] = [];
async function run(args: readonly string[]): Promise<number> {
  let code = 0; const signal = new Error('captured exit');
  const exit = vi.spyOn(process, 'exit').mockImplementation((value) => { code = Number(value ?? 0); throw signal; });
  try { await runCli(['node', 'inject-agents-settings', ...args]); } catch (error) { if (error !== signal) throw error; } finally { exit.mockRestore(); }
  return code;
}
afterEach(() => { for (const root of roots.splice(0)) removeRoot(root); vi.restoreAllMocks(); });
it.each([
  'package-required', 'invalid-package', 'unknown-option', 'option-value-required',
  'invalid-agent', 'invalid-scope', 'invalid-asset', 'absolute-asset-path',
  'unresolved-package', 'missing-asset-directory', 'escaping-asset-directory',
  'missing-hash-source', 'empty-scope', 'corrupt-scope',
])('%s carries equivalent final failure records in every output mode', async (kind) => {
  const outcomes = [];
  for (const mode of ['plain', 'json', 'ink'] as const) {
    const root = makeRoot('preflight-equivalence'); roots.push(root);
    installPackage(root, { name: '@probe/a', assets: kind === 'missing-hash-source' ? {} : { 'rules/a.md': 'rule' } });
    if (kind === 'corrupt-scope') writeAt(join(root, 'node_modules/@broken/a/package.json'), '{invalid');
    let args = ['--package=@probe/a', '--agent=claude', '--scope=project'];
    if (kind === 'package-required') args = args.filter((arg) => !arg.startsWith('--package'));
    if (kind === 'invalid-package') args[0] = '--package=@bad/';
    if (kind === 'unknown-option') args.push('--unknown');
    if (kind === 'option-value-required') args.push('--asset-path');
    if (kind === 'invalid-agent') args[1] = '--agent=invalid';
    if (kind === 'invalid-scope') args[2] = '--scope=invalid';
    if (kind === 'invalid-asset') args.push('--asset=invalid');
    if (kind === 'absolute-asset-path') args.push('--asset-path=/absolute');
    if (kind === 'unresolved-package') args[0] = '--package=@missing/a';
    if (kind === 'missing-asset-directory') args.push('--asset-path=missing');
    if (kind === 'escaping-asset-directory') args.push('--asset-path=../../../outside');
    if (kind === 'empty-scope') args[0] = '--package=@missing';
    if (kind === 'corrupt-scope') args[0] = '--package=@broken';
    let stdout = ''; let stderr = ''; let frame = ''; let report: RunResult | undefined;
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => { stdout += String(chunk); return true; });
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => { stderr += String(chunk); return true; });
    const tty = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', { value: mode === 'ink', configurable: true });
    const original = views.renderOrFallback;
    vi.spyOn(views, 'renderOrFallback').mockImplementation(async (...values) => { report = values[5]; return original(...values); });
    vi.spyOn(ui, 'renderInjectApp').mockImplementation((input) => new Promise((resolve, reject) => {
      const app = render(<InjectApp {...input} onExit={(code) => { clearTimeout(timer); frame = app.lastFrame() ?? ''; app.unmount(); resolve(code); }} />);
      const timer = setTimeout(() => { app.unmount(); reject(new Error('terminal timeout')); }, 4000);
    }));
    try {
      const code = await run([...args, `--root=${root}`, ...(mode === 'json' ? ['--json'] : []), ...(mode === 'plain' ? ['--no-interactive'] : [])]);
      expect(code).toBe(2); expect(report?.failures?.length).toBeGreaterThan(0);
      const transcript = mode === 'ink' ? frame : mode === 'json' ? JSON.parse(stdout).failures.map((failure: { path: string; reason: string }) => `${failure.path} ${failure.reason}`).join('\n') : stdout + stderr;
      for (const failure of report?.failures ?? []) {
        expect(transcript.replace(/\s+/g, ''), `${kind}:${mode}`).toContain(failure.path.replace(/\s+/g, ''));
        expect(transcript.replace(/\s+/g, ''), `${kind}:${mode}`).toContain(failure.reason.replace(/\s+/g, ''));
      }
      outcomes.push({ code, report: JSON.parse(JSON.stringify(report).split(realpathSync(root)).join('<root>').split(root).join('<root>')) });
    } finally { if (tty) Object.defineProperty(process.stdout, 'isTTY', tty); else Reflect.deleteProperty(process.stdout, 'isTTY'); vi.restoreAllMocks(); }
  }
  expect(outcomes[1]).toEqual(outcomes[0]); expect(outcomes[2]).toEqual(outcomes[0]);
});
